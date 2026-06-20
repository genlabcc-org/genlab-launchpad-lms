package cc.genlab.genlablaunchpadlmsapi.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HealthControllerTest {

    private JdbcTemplate jdbcTemplate;
    private HealthController healthController;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        healthController = new HealthController(jdbcTemplate);
    }

    @Test
    void healthReturnsUpWhenDbIsHealthy() {
        // Arrange
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class)).thenReturn(1);

        // Act
        ResponseEntity<Map<String, Object>> response = healthController.getHealth();

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("UP", body.get("status"));
        assertEquals("UP", body.get("database"));
        assertTrue(body.containsKey("timestamp"));
        
        verify(jdbcTemplate, times(1)).queryForObject("SELECT 1", Integer.class);
    }

    @Test
    void healthReturnsDownWhenDbThrowsException() {
        // Arrange
        when(jdbcTemplate.queryForObject("SELECT 1", Integer.class))
                .thenThrow(new RuntimeException("Connection timeout"));

        // Act
        ResponseEntity<Map<String, Object>> response = healthController.getHealth();

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("DOWN", body.get("status"));
        assertEquals("DOWN", body.get("database"));
        assertEquals("Connection timeout", body.get("error"));
        assertTrue(body.containsKey("timestamp"));
        
        verify(jdbcTemplate, times(1)).queryForObject("SELECT 1", Integer.class);
    }
}
