package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateMentorRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import cc.genlab.genlablaunchpadlmsapi.service.port.MentorServicePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminMentorController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminMentorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MentorServicePort mentorService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID mentorId;
    private MentorDto mentorDto;

    @BeforeEach
    void setUp() {
        mentorId = UUID.randomUUID();
        mentorDto = new MentorDto(mentorId, "Test Mentor", "test.mentor.genlab@gmail.com");
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getAllMentors_asAdmin_shouldReturnList() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(mentorService.getAllMentors()).thenReturn(List.of(mentorDto));

        mockMvc.perform(get("/api/admin/mentors")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Mentor"))
                .andExpect(jsonPath("$[0].email").value("test.mentor.genlab@gmail.com"));
    }

    @Test
    @WithMockUser(username = "mentor-user")
    void getAllMentors_asMentor_shouldReturnForbidden() throws Exception {
        when(roleService.getRoleForUser("mentor-user")).thenReturn("mentor");

        mockMvc.perform(get("/api/admin/mentors")
                        .requestAttr("userId", "mentor-user"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getMentorById_asAdmin_shouldReturnMentor() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(mentorService.getMentorProfile(mentorId.toString())).thenReturn(mentorDto);

        mockMvc.perform(get("/api/admin/mentors/" + mentorId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Mentor"))
                .andExpect(jsonPath("$.id").value(mentorId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createMentor_withValidData_shouldReturnCreated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");

        CreateUserResponse response = CreateUserResponse.builder()
                .userId(mentorId.toString())
                .role("mentor")
                .name("New Mentor")
                .message("User created successfully")
                .build();
        when(mentorService.createMentor(any(CreateUserRequest.class))).thenReturn(response);

        String requestBody = """
                {
                  "name": "New Mentor",
                  "email": "new.mentor.genlab@gmail.com"
                }
                """;

        mockMvc.perform(post("/api/admin/mentors")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(mentorId.toString()))
                .andExpect(jsonPath("$.role").value("mentor"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createMentor_withoutName_shouldReturnBadRequest() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(mentorService.createMentor(any(CreateUserRequest.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required"));

        String requestBody = """
                {
                  "email": "new.mentor.genlab@gmail.com"
                }
                """;

        mockMvc.perform(post("/api/admin/mentors")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createMentor_withInvalidEmail_shouldReturnBadRequest() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(mentorService.createMentor(any(CreateUserRequest.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "email ending in .genlab@gmail.com is required"));

        String requestBody = """
                {
                  "name": "New Mentor",
                  "email": "new.mentor@gmail.com"
                }
                """;

        mockMvc.perform(post("/api/admin/mentors")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updateMentor_withValidData_shouldReturnUpdated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(mentorService.updateMentor(eq(mentorId), any(UpdateMentorRequest.class))).thenReturn(mentorDto);

        String requestBody = """
                {
                  "name": "Updated Name",
                  "email": "updated.mentor.genlab@gmail.com"
                }
                """;

        mockMvc.perform(put("/api/admin/mentors/" + mentorId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Mentor"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deleteMentor_shouldReturnNoContent() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(mentorService).deleteMentor(mentorId);

        mockMvc.perform(delete("/api/admin/mentors/" + mentorId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
