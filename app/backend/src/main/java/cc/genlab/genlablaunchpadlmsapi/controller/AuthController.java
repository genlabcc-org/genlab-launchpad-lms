package cc.genlab.genlablaunchpadlmsapi.controller;

import cc.genlab.genlablaunchpadlmsapi.repository.MentorRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final SupabaseProperties supabaseProperties;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final WebClient webClient;

    public AuthController(StudentRepository studentRepository, MentorRepository mentorRepository, SupabaseProperties supabaseProperties) {
        this.studentRepository = studentRepository;
        this.mentorRepository = mentorRepository;
        this.supabaseProperties = supabaseProperties;
        this.webClient = WebClient.create();
    }

    private List<String> getSeededAdmins() {
        String seededAdminsProperty = supabaseProperties.getSeededAdmins();
        if (seededAdminsProperty == null || seededAdminsProperty.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(seededAdminsProperty.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();
    }

    // ─── STUDENT (Phone OTP) ──────────────────────────────────

    @PostMapping("/student/send-otp")
    public ResponseEntity<?> studentSendOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || !phone.startsWith("+")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Phone must be in E.164 format e.g. +91XXXXXXXXXX"));
        }

        // Only sign-in allowed: user must be pre-registered in our database
        if (studentRepository.findByPhone(phone).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Student is not registered. Only sign-in is allowed."));
        }

        try {
            webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/otp")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "phone", phone,
                            "create_user", false
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            return ResponseEntity.ok(Map.of("message", "OTP sent to " + phone));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send OTP via Supabase: " + e.getMessage()));
        }
    }

    @PostMapping("/student/verify-otp")
    public ResponseEntity<?> studentVerifyOtp(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String token = body.get("token");

        if (phone == null || token == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone and token are required"));
        }

        try {
            Map<?, ?> response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/verify")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "phone", phone,
                            "token", token,
                            "type", "sms"
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "OTP verification failed: " + e.getMessage()));
        }
    }

    // ─── MENTOR (Email OTP) ───────────────────────────────────

    @PostMapping("/mentor/send-otp")
    public ResponseEntity<?> mentorSendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.toLowerCase().endsWith(".genlab@gmail.com")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only emails ending in .genlab@gmail.com are allowed for mentors"));
        }

        // Only sign-in allowed: user must be pre-registered in our database
        if (mentorRepository.findByEmail(email.toLowerCase()).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Mentor is not registered. Only sign-in is allowed."));
        }

        try {
            webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/otp")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", email,
                            "create_user", false
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send OTP via Supabase: " + e.getMessage()));
        }
    }

    @PostMapping("/mentor/verify-otp")
    public ResponseEntity<?> mentorVerifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");

        if (email == null || token == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and token are required"));
        }

        if (!email.toLowerCase().endsWith(".genlab@gmail.com")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only emails ending in .genlab@gmail.com are allowed for mentors"));
        }

        try {
            Map<?, ?> response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/verify")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", email,
                            "token", token,
                            "type", "email"
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "OTP verification failed: " + e.getMessage()));
        }
    }

    // ─── ADMIN (Email OTP) ────────────────────────────────────

    @PostMapping("/admin/send-otp")
    public ResponseEntity<?> adminSendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.toLowerCase().endsWith("@genlab.cc")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only @genlab.cc email addresses are allowed for admins"));
        }

        // Verify email is in the seeded admins list
        if (!getSeededAdmins().contains(email.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "This admin email is not authorized or pre-seeded"));
        }

        try {
            webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/otp")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", email,
                            "create_user", true
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send OTP via Supabase: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/verify-otp")
    public ResponseEntity<?> adminVerifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");

        if (email == null || token == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and token are required"));
        }

        if (!email.toLowerCase().endsWith("@genlab.cc")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only @genlab.cc email addresses are allowed for admins"));
        }

        try {
            Map<?, ?> response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/verify")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", email,
                            "token", token,
                            "type", "email"
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "OTP verification failed: " + e.getMessage()));
        }
    }
}
