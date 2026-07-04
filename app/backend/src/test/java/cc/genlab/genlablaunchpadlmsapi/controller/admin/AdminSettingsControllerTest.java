package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import cc.genlab.genlablaunchpadlmsapi.service.port.SettingsServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminSettingsController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SettingsServicePort settingsService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    @WithMockUser(username = "admin-user")
    void getSettings_whenAdmin_shouldReturn200WithMap() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(settingsService.getSettings()).thenReturn(
                Map.of("org.name", "PEC Developers Initiative", "payment.accepted_methods", "cash,upi")
        );

        // Act & Assert
        mockMvc.perform(get("/api/admin/settings")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.['org.name']").value("PEC Developers Initiative"))
                .andExpect(jsonPath("$.['payment.accepted_methods']").value("cash,upi"));
    }

    @Test
    @WithMockUser(username = "mentor-user")
    void getSettings_whenNonAdmin_shouldReturn403() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("mentor-user")).thenReturn("mentor");

        // Act & Assert
        mockMvc.perform(get("/api/admin/settings")
                        .requestAttr("userId", "mentor-user"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updateSettings_whenAdmin_shouldReturn200WithMessage() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(settingsService).updateSettings(any());

        // Act & Assert
        mockMvc.perform(put("/api/admin/settings")
                        .with(csrf())
                        .requestAttr("userId", "admin-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"org.name\":\"New Org Name\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Settings updated successfully"));
    }

    @Test
    @WithMockUser(username = "student-user")
    void updateSettings_whenNonAdmin_shouldReturn403() throws Exception {
        // Arrange
        when(roleService.getRoleForUser("student-user")).thenReturn("student");

        // Act & Assert
        mockMvc.perform(put("/api/admin/settings")
                        .with(csrf())
                        .requestAttr("userId", "student-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"org.name\":\"New Org Name\"}"))
                .andExpect(status().isForbidden());
    }
}
