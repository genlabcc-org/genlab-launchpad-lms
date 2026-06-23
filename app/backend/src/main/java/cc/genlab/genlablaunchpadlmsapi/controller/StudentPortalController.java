package cc.genlab.genlablaunchpadlmsapi.controller;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentPortalController {

    @GetMapping("/dashboard")
    @RequiresRole("student")
    public ResponseEntity<?> dashboard() {
        return ResponseEntity.ok(Map.of("message", "Welcome student"));
    }

    @GetMapping("/profile")
    @RequiresRole("student")
    public ResponseEntity<?> profile(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of(
                "userId", request.getAttribute("userId"),
                "email", request.getAttribute("email"),
                "phone", request.getAttribute("phone")
        ));
    }
}
