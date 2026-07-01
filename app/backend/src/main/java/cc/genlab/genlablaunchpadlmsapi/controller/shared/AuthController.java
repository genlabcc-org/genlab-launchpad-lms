package cc.genlab.genlablaunchpadlmsapi.controller.shared;

import cc.genlab.genlablaunchpadlmsapi.model.dto.request.PhoneOtpRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.PhoneVerifyRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EmailOtpRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EmailVerifyRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import cc.genlab.genlablaunchpadlmsapi.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ─── STUDENT (Phone OTP) ──────────────────────────────────

    @PostMapping("/student/send-otp")
    public MessageResponse studentSendOtp(@RequestBody PhoneOtpRequest request) {
        String phone = request.phone();
        if (phone == null || !phone.startsWith("+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone must be in E.164 format e.g. +91XXXXXXXXXX");
        }

        try {
            authService.sendStudentOtp(phone);
            return new MessageResponse("OTP sent to " + phone);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP via Supabase: " + e.getMessage(), e);
        }
    }

    @PostMapping("/student/verify-otp")
    public Map<?, ?> studentVerifyOtp(@RequestBody PhoneVerifyRequest request) {
        String phone = request.phone();
        String token = request.token();

        if (phone == null || token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone and token are required");
        }

        try {
            return authService.verifyStudentOtp(phone, token);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }

    // ─── MENTOR (Email OTP) ───────────────────────────────────

    @PostMapping("/mentor/send-otp")
    public MessageResponse mentorSendOtp(@RequestBody EmailOtpRequest request) {
        String email = request.email();
        if (email == null || !email.toLowerCase().endsWith(".genlab@gmail.com")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only emails ending in .genlab@gmail.com are allowed for mentors");
        }

        try {
            authService.sendMentorOtp(email);
            return new MessageResponse("OTP sent to " + email);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP via Supabase: " + e.getMessage(), e);
        }
    }

    @PostMapping("/mentor/verify-otp")
    public Map<?, ?> mentorVerifyOtp(@RequestBody EmailVerifyRequest request) {
        String email = request.email();
        String token = request.token();

        if (email == null || token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and token are required");
        }

        if (!email.toLowerCase().endsWith(".genlab@gmail.com")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only emails ending in .genlab@gmail.com are allowed for mentors");
        }

        try {
            return authService.verifyMentorOtp(email, token);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }

    // ─── ADMIN (Email OTP) ────────────────────────────────────

    @PostMapping("/admin/send-otp")
    public MessageResponse adminSendOtp(@RequestBody EmailOtpRequest request) {
        String email = request.email();
        if (email == null || !email.toLowerCase().endsWith("@genlab.cc")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only @genlab.cc email addresses are allowed for admins");
        }

        try {
            authService.sendAdminOtp(email);
            return new MessageResponse("OTP sent to " + email);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP via Supabase: " + e.getMessage(), e);
        }
    }

    @PostMapping("/admin/verify-otp")
    public Map<?, ?> adminVerifyOtp(@RequestBody EmailVerifyRequest request) {
        String email = request.email();
        String token = request.token();

        if (email == null || token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and token are required");
        }

        if (!email.toLowerCase().endsWith("@genlab.cc")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only @genlab.cc email addresses are allowed for admins");
        }

        try {
            return authService.verifyAdminOtp(email, token);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }
}
