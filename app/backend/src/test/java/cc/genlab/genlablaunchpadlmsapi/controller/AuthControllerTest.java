package cc.genlab.genlablaunchpadlmsapi.controller;

import cc.genlab.genlablaunchpadlmsapi.controller.shared.AuthController;
import cc.genlab.genlablaunchpadlmsapi.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void studentSendOtp_withUnregisteredPhone_shouldReturnBadRequest() throws Exception {
        // Arrange
        String phone = "+1234567890";
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student is not registered. Only sign-in is allowed."))
                .when(authService).sendStudentOtp(phone);

        // Act & Assert
        mockMvc.perform(post("/auth/student/send-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"" + phone + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Student is not registered. Only sign-in is allowed."));
    }

    @Test
    void studentSendOtp_withInvalidPhoneFormat_shouldReturnBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/student/send-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"12345\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Phone must be in E.164 format e.g. +91XXXXXXXXXX"));
    }

    @Test
    void mentorSendOtp_withInvalidEmailDomain_shouldReturnForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/mentor/send-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"mentor@gmail.com\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only emails ending in .genlab@gmail.com are allowed for mentors"));
    }

    @Test
    void mentorSendOtp_withUnregisteredMentor_shouldReturnBadRequest() throws Exception {
        // Arrange
        String email = "alice.genlab@gmail.com";
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mentor is not registered. Only sign-in is allowed."))
                .when(authService).sendMentorOtp(email);

        // Act & Assert
        mockMvc.perform(post("/auth/mentor/send-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Mentor is not registered. Only sign-in is allowed."));
    }

    @Test
    void adminSendOtp_withInvalidEmailDomain_shouldReturnForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/auth/admin/send-otp")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@gmail.com\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only @genlab.cc email addresses are allowed for admins"));
    }
}
