package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CourseRequest;

import java.util.List;
import java.util.UUID;

/**
 * Port interface for course domain operations.
 */
public interface CourseServicePort {

    List<CourseDto> getAllCourses();

    CourseDto getCourseById(UUID id);

    CourseDto createCourse(CourseRequest request);

    CourseDto updateCourse(UUID id, CourseRequest request);

    void deleteCourse(UUID id);
}
