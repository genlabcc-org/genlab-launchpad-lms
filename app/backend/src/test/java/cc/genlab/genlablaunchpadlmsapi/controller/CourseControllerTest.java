package cc.genlab.genlablaunchpadlmsapi.controller;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @Test
    void shouldReturnEmptyListWhenNoCourses() throws Exception {
        when(courseService.getAllCourses()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void shouldReturnCoursesList() throws Exception {
        CourseDto courseDto = new CourseDto(
                UUID.randomUUID(),
                "Introduction to Spring Boot",
                "Learn the core concepts of Spring Boot.",
                OffsetDateTime.now()
        );

        when(courseService.getAllCourses()).thenReturn(List.of(courseDto));

        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Introduction to Spring Boot"))
                .andExpect(jsonPath("$[0].description").value("Learn the core concepts of Spring Boot."));
    }
}
