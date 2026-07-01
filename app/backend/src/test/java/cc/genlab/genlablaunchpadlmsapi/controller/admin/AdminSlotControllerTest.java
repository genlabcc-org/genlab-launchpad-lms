package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateSlotRequest;
import cc.genlab.genlablaunchpadlmsapi.service.SlotService;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminSlotController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminSlotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SlotService slotService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID slotId;
    private SlotDto slotDto;

    @BeforeEach
    void setUp() {
        slotId = UUID.randomUUID();
        slotDto = new SlotDto(
                slotId,
                "10am - 12pm",
                LocalTime.of(10, 0),
                LocalTime.of(12, 0)
        );
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getAllSlots_asAdmin_shouldReturnList() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(slotService.getAllSlots()).thenReturn(List.of(slotDto));

        mockMvc.perform(get("/api/admin/slots")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("10am - 12pm"))
                .andExpect(jsonPath("$[0].id").value(slotId.toString()));
    }

    @Test
    @WithMockUser(username = "student-user")
    void getAllSlots_asStudent_shouldReturnForbidden() throws Exception {
        when(roleService.getRoleForUser("student-user")).thenReturn("student");

        mockMvc.perform(get("/api/admin/slots")
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getSlotById_asAdmin_shouldReturnSlot() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(slotService.getSlotById(slotId)).thenReturn(slotDto);

        mockMvc.perform(get("/api/admin/slots/" + slotId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(slotId.toString()))
                .andExpect(jsonPath("$.name").value("10am - 12pm"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getSlotById_notFound_shouldReturnNotFound() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(slotService.getSlotById(slotId)).thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));

        mockMvc.perform(get("/api/admin/slots/" + slotId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createSlot_withValidData_shouldReturnCreated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(slotService.createSlot(any(CreateSlotRequest.class))).thenReturn(slotDto);

        String requestBody = """
                {
                  "startTime": "10:00:00",
                  "endTime": "12:00:00"
                }
                """;

        mockMvc.perform(post("/api/admin/slots")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(slotId.toString()))
                .andExpect(jsonPath("$.name").value("10am - 12pm"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updateSlot_withValidData_shouldReturnUpdated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(slotService.updateSlot(eq(slotId), any(CreateSlotRequest.class))).thenReturn(slotDto);

        String requestBody = """
                {
                  "startTime": "10:00:00"
                }
                """;

        mockMvc.perform(put("/api/admin/slots/" + slotId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(slotId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deleteSlot_shouldReturnNoContent() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(slotService).deleteSlot(slotId);

        mockMvc.perform(delete("/api/admin/slots/" + slotId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deleteSlot_assignedToSchedules_shouldReturnBadRequest() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete slot because it is assigned to one or more mentor schedules"))
                .when(slotService).deleteSlot(slotId);

        mockMvc.perform(delete("/api/admin/slots/" + slotId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
