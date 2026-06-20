package cc.genlab.genlablaunchpadlmsapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> details = new HashMap<>();
        details.put("timestamp", System.currentTimeMillis());
        
        try {
            // Check connectivity to the database
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            details.put("status", "UP");
            details.put("database", "UP");
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            details.put("status", "DOWN");
            details.put("database", "DOWN");
            details.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(details);
        }
    }
}
