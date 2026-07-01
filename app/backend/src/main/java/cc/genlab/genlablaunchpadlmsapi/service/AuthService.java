package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SupabaseProperties supabaseProperties;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final WebClient webClient = WebClient.create();

    private List<String> getSeededAdmins() {
        String seededAdminsProperty = supabaseProperties.getSeededAdmins();
        if (seededAdminsProperty == null || seededAdminsProperty.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(seededAdminsProperty.split(","))
                .map(s -> s.trim())
                .map(s -> s.toLowerCase())
                .toList();
    }

    public void sendStudentOtp(String phone) {
        if (studentRepository.findByPhone(phone).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student is not registered. Only sign-in is allowed.");
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
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP via Supabase: " + e.getMessage(), e);
        }
    }

    public Map<?, ?> verifyStudentOtp(String phone, String token) {
        try {
            return webClient.post()
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
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }

    public void sendMentorOtp(String email) {
        if (mentorRepository.findByEmail(email.toLowerCase()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mentor is not registered. Only sign-in is allowed.");
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
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP via Supabase: " + e.getMessage(), e);
        }
    }

    public Map<?, ?> verifyMentorOtp(String email, String token) {
        try {
            return webClient.post()
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
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }

    public void sendAdminOtp(String email) {
        if (!getSeededAdmins().contains(email.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This admin email is not authorized or pre-seeded");
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
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP via Supabase: " + e.getMessage(), e);
        }
    }

    public Map<?, ?> verifyAdminOtp(String email, String token) {
        try {
            return webClient.post()
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
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }
}
