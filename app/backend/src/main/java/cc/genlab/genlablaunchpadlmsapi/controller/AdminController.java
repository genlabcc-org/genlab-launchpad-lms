package cc.genlab.genlablaunchpadlmsapi.controller;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Mentor;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Student;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.StudentRepository;
import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final SupabaseProperties supabaseProperties;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final WebClient webClient;

    public AdminController(StudentRepository studentRepository, MentorRepository mentorRepository, SupabaseProperties supabaseProperties) {
        this.studentRepository = studentRepository;
        this.mentorRepository = mentorRepository;
        this.supabaseProperties = supabaseProperties;
        this.webClient = WebClient.create();
    }

    @GetMapping("/dashboard")
    @RequiresRole("admin")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome admin"));
    }

    @GetMapping("/students")
    @RequiresRole("admin")
    public ResponseEntity<?> listStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @PostMapping("/users")
    @RequiresRole("admin")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String role = body.get("role"); // "student" or "mentor"
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");

        if (role == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "role and name are required"));
        }

        Map<String, Object> supabaseBody = new HashMap<>();
        supabaseBody.put("user_metadata", Map.of("name", name));

        if ("student".equalsIgnoreCase(role)) {
            if (phone == null || !phone.startsWith("+")) {
                return ResponseEntity.badRequest().body(Map.of("error", "phone starting with + is required for student"));
            }
            supabaseBody.put("phone", phone);
            supabaseBody.put("phone_confirm", true);
            if (email != null) {
                supabaseBody.put("email", email);
            }
        } else if ("mentor".equalsIgnoreCase(role)) {
            if (email == null || !email.toLowerCase().endsWith(".genlab@gmail.com")) {
                return ResponseEntity.badRequest().body(Map.of("error", "email ending in .genlab@gmail.com is required for mentor"));
            }
            supabaseBody.put("email", email);
            supabaseBody.put("email_confirm", true);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + role));
        }

        try {
            // Call Supabase Admin API to create user
            Map<?, ?> response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/admin/users")
                    .header("apikey", supabaseProperties.getServiceRoleKey())
                    .header("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(supabaseBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("id")) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve user ID from Supabase response");
            }

            String userIdStr = (String) response.get("id");
            UUID userId = UUID.fromString(userIdStr);

            if ("student".equalsIgnoreCase(role)) {
                Student student = Student.builder()
                        .id(userId)
                        .name(name)
                        .email(email)
                        .phone(phone)
                        .build();
                studentRepository.save(student);
            } else {
                Mentor mentor = Mentor.builder()
                        .id(userId)
                        .name(name)
                        .email(email)
                        .build();
                mentorRepository.save(mentor);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "userId", userIdStr,
                    "role", role,
                    "name", name,
                    "message", "User created successfully in Supabase and local DB"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }
}
