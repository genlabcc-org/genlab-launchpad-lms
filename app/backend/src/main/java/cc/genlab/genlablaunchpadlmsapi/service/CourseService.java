package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CourseRequest;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Course;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Mentor;
import cc.genlab.genlablaunchpadlmsapi.repository.CourseRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorRepository;
import cc.genlab.genlablaunchpadlmsapi.service.port.CourseServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService implements CourseServicePort {

    private final CourseRepository courseRepository;
    private final MentorRepository mentorRepository;

    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(CourseDto::fromEntity)
                .toList();
    }

    public CourseDto getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return CourseDto.fromEntity(course);
    }

    @Transactional
    public CourseDto createCourse(CourseRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course title is required");
        }

        List<Mentor> mentors = new ArrayList<>();
        if (request.getMentorIds() != null && !request.getMentorIds().isEmpty()) {
            mentors = mentorRepository.findAllById(request.getMentorIds());
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice() != null ? request.getPrice() : java.math.BigDecimal.ZERO)
                .syllabus(request.getSyllabus() != null ? request.getSyllabus() : new ArrayList<>())
                .mentors(mentors)
                .build();

        Course saved = courseRepository.save(course);
        return CourseDto.fromEntity(saved);
    }

    @Transactional
    public CourseDto updateCourse(UUID id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (request.getTitle() != null) {
            if (request.getTitle().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course title cannot be empty");
            }
            course.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }
        if (request.getSyllabus() != null) {
            course.setSyllabus(request.getSyllabus());
        }
        if (request.getMentorIds() != null) {
            List<Mentor> mentors = mentorRepository.findAllById(request.getMentorIds());
            course.setMentors(mentors);
        }

        Course saved = courseRepository.save(course);
        return CourseDto.fromEntity(saved);
    }

    @Transactional
    public void deleteCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        courseRepository.delete(course);
    }
}

