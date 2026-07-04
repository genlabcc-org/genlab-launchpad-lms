package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CourseRequest;
import cc.genlab.genlablaunchpadlmsapi.service.port.CourseServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/courses")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseServicePort courseService;

    @GetMapping
    public ResponseEntity<List<CourseDto>> getAllCourses(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {
        
        long totalCount = courseService.getTotalCoursesCount();
        List<CourseDto> courses = courseService.getAllCourses(page, size, sortBy, sortOrder);
        
        return ResponseEntity.ok()
                .header("Access-Control-Expose-Headers", "X-Total-Count")
                .header("X-Total-Count", String.valueOf(totalCount))
                .body(courses);
    }

    @GetMapping("/{id}")
    public CourseDto getCourseById(@PathVariable UUID id) {
        return courseService.getCourseById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDto createCourse(@RequestBody CourseRequest request) {
        return courseService.createCourse(request);
    }

    @PutMapping("/{id}")
    public CourseDto updateCourse(@PathVariable UUID id, @RequestBody CourseRequest request) {
        return courseService.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
    }

    @GetMapping("/{id}/capacity")
    public cc.genlab.genlablaunchpadlmsapi.model.dto.CourseCapacityDto getCourseCapacity(
            @PathVariable UUID id,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        return courseService.getCourseCapacity(id, startDate, endDate);
    }
}
