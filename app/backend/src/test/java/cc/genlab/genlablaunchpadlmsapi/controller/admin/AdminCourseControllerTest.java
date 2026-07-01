package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.config.SupabaseProperties;
import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CourseRequest;
import cc.genlab.genlablaunchpadlmsapi.service.CourseService;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import cc.genlab.genlablaunchpadlmsapi.aspect.RoleCheckAspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
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

@WebMvcTest(AdminCourseController.class)
@Import({RoleCheckAspect.class, org.springframework.boot.autoconfigure.aop.AopAutoConfiguration.class})
class AdminCourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    private UUID courseId;
    private CourseDto courseDto;

    @BeforeEach
    void setUp() {
        courseId = UUID.randomUUID();
        courseDto = new CourseDto(
                courseId,
                "Java 25 Course",
                "Advanced programming in Java 25",
                java.math.BigDecimal.valueOf(199.99),
                List.of(),
                List.of("Intro", "Advanced features"),
                OffsetDateTime.now()
        );
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getAllCourses_asAdmin_shouldReturnList() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(courseService.getAllCourses()).thenReturn(List.of(courseDto));

        mockMvc.perform(get("/api/admin/courses")
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java 25 Course"))
                .andExpect(jsonPath("$[0].description").value("Advanced programming in Java 25"));
    }

    @Test
    @WithMockUser(username = "student-user")
    void getAllCourses_asStudent_shouldReturnForbidden() throws Exception {
        when(roleService.getRoleForUser("student-user")).thenReturn("student");

        mockMvc.perform(get("/api/admin/courses")
                        .requestAttr("userId", "student-user"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin-user")
    void getCourseById_asAdmin_shouldReturnCourse() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(courseService.getCourseById(courseId)).thenReturn(courseDto);

        mockMvc.perform(get("/api/admin/courses/" + courseId)
                        .requestAttr("userId", "admin-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java 25 Course"))
                .andExpect(jsonPath("$.id").value(courseId.toString()));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void createCourse_withValidData_shouldReturnCreated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(courseService.createCourse(any(CourseRequest.class))).thenReturn(courseDto);

        String requestBody = """
                {
                  "title": "Java 25 Course",
                  "description": "Advanced programming in Java 25",
                  "price": 199.99,
                  "syllabus": ["Intro", "Advanced features"]
                }
                """;

        mockMvc.perform(post("/api/admin/courses")
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Java 25 Course"))
                .andExpect(jsonPath("$.price").value(199.99));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void updateCourse_withValidData_shouldReturnUpdated() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        when(courseService.updateCourse(eq(courseId), any(CourseRequest.class))).thenReturn(courseDto);

        String requestBody = """
                {
                  "title": "Updated Java Course"
                }
                """;

        mockMvc.perform(put("/api/admin/courses/" + courseId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java 25 Course"));
    }

    @Test
    @WithMockUser(username = "admin-user")
    void deleteCourse_shouldReturnNoContent() throws Exception {
        when(roleService.getRoleForUser("admin-user")).thenReturn("admin");
        doNothing().when(courseService).deleteCourse(courseId);

        mockMvc.perform(delete("/api/admin/courses/" + courseId)
                        .requestAttr("userId", "admin-user")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
