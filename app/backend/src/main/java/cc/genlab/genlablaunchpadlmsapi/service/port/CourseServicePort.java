package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CourseRequest;

import java.util.List;
import java.util.UUID;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseCapacityDto;
import java.time.LocalDate;

/**
 * Port interface for course domain operations.
 */
public interface CourseServicePort {

    List<CourseDto> getAllCourses();

    List<CourseDto> getAllCourses(Integer page, Integer size, String sortBy, String sortOrder);

    long getTotalCoursesCount();

    CourseDto getCourseById(UUID id);

    CourseDto createCourse(CourseRequest request);

    CourseDto updateCourse(UUID id, CourseRequest request);

    void deleteCourse(UUID id);

    CourseCapacityDto getCourseCapacity(UUID courseId, LocalDate startDate, LocalDate endDate);
}
