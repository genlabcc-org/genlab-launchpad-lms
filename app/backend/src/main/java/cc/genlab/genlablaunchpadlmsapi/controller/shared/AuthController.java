package cc.genlab.genlablaunchpadlmsapi.controller.shared;

import cc.genlab.genlablaunchpadlmsapi.model.dto.request.PhoneOtpRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.PhoneVerifyRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EmailOtpRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EmailVerifyRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import cc.genlab.genlablaunchpadlmsapi.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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
    public Map<?, ?> studentVerifyOtp(@RequestBody PhoneVerifyRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String phone = request.phone();
        String token = request.token();

        if (phone == null || token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone and token are required");
        }

        try {
            Map<?, ?> result = authService.verifyStudentOtp(phone, token);
            if (result != null && result.containsKey("access_token")) {
                setAuthCookie(httpRequest, httpResponse, (String) result.get("access_token"));
            }
            return result;
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
    public Map<?, ?> mentorVerifyOtp(@RequestBody EmailVerifyRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = request.email();
        String token = request.token();

        if (email == null || token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and token are required");
        }

        if (!email.toLowerCase().endsWith(".genlab@gmail.com")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only emails ending in .genlab@gmail.com are allowed for mentors");
        }

        try {
            Map<?, ?> result = authService.verifyMentorOtp(email, token);
            if (result != null && result.containsKey("access_token")) {
                setAuthCookie(httpRequest, httpResponse, (String) result.get("access_token"));
            }
            return result;
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
    public Map<?, ?> adminVerifyOtp(@RequestBody EmailVerifyRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = request.email();
        String token = request.token();

        if (email == null || token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and token are required");
        }

        if (!email.toLowerCase().endsWith("@genlab.cc")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only @genlab.cc email addresses are allowed for admins");
        }

        try {
            Map<?, ?> result = authService.verifyAdminOtp(email, token);
            if (result != null && result.containsKey("access_token")) {
                setAuthCookie(httpRequest, httpResponse, (String) result.get("access_token"));
            }
            return result;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed: " + e.getMessage(), e);
        }
    }

    @PostMapping("/logout")
    public MessageResponse logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        ResponseCookie cookie = ResponseCookie.from("authToken", "")
                .httpOnly(true)
                .secure(httpRequest.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return new MessageResponse("Logged out successfully");
    }

    private void setAuthCookie(HttpServletRequest request, HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)
                .secure(request.isSecure())
                .sameSite("Lax")
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // 30 days
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
