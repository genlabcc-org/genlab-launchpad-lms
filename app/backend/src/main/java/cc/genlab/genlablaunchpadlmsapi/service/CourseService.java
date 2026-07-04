package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseCapacityDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CourseRequest;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Course;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Mentor;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Enrollment;
import cc.genlab.genlablaunchpadlmsapi.repository.CourseRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.SlotRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.EnrollmentRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.SystemSettingRepository;
import cc.genlab.genlablaunchpadlmsapi.service.port.CourseServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class CourseService implements CourseServicePort {

    private final CourseRepository courseRepository;
    private final MentorRepository mentorRepository;
    private final SlotRepository slotRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SystemSettingRepository systemSettingRepository;

    @Override
    public List<CourseDto> getAllCourses() {
        return getAllCourses(null, null, null, null);
    }

    @Override
    public List<CourseDto> getAllCourses(Integer page, Integer size, String sortBy, String sortOrder) {
        if (page == null || size == null) {
            if (sortBy != null && !sortBy.trim().isEmpty()) {
                Sort sort = Sort.by(Sort.Direction.fromString(sortOrder != null && sortOrder.equalsIgnoreCase("desc") ? "DESC" : "ASC"), sortBy);
                return courseRepository.findAll(sort).stream()
                        .map(CourseDto::fromEntity)
                        .toList();
            }
            return courseRepository.findAll().stream()
                    .map(CourseDto::fromEntity)
                    .toList();
        }

        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            sort = Sort.by(Sort.Direction.fromString(sortOrder != null && sortOrder.equalsIgnoreCase("desc") ? "DESC" : "ASC"), sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        return courseRepository.findAll(pageable).getContent().stream()
                .map(CourseDto::fromEntity)
                .toList();
    }

    @Override
    public long getTotalCoursesCount() {
        return courseRepository.count();
    }

    public CourseDto getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return CourseDto.fromEntity(course, calculateWeeklyActivity(id, course.getDurationInDays()));
    }

    private List<Integer> calculateWeeklyActivity(UUID courseId, Integer durationInDays) {
        List<Enrollment> enrollments = enrollmentRepository.findActiveEnrollmentsByCourseId(courseId);
        List<Integer> weeklyCounts = new ArrayList<>();
        int days = durationInDays != null ? durationInDays : 90;
        
        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        for (int i = 6; i >= 0; i--) {
            java.time.OffsetDateTime weekStart = now.minusWeeks(i).with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            java.time.OffsetDateTime weekEnd = weekStart.plusDays(6);
            
            long activeCount = enrollments.stream()
                .filter(e -> e.getCreatedAt() != null)
                .filter(e -> !e.getCreatedAt().isAfter(weekEnd))
                .filter(e -> !e.getCreatedAt().isBefore(weekStart.minusDays(days)))
                .count();
                
            weeklyCounts.add((int) activeCount);
        }
        return weeklyCounts;
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
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
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
        if (request.getIsActive() != null) {
            course.setActive(request.getIsActive());
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

    @Transactional(readOnly = true)
    @Override
    public CourseCapacityDto getCourseCapacity(UUID courseId, LocalDate startDate, LocalDate endDate) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        List<SlotDto> slots = slotRepository.findAll().stream()
                .map(SlotDto::fromEntity)
                .toList();

        List<MentorDto> mentors = course.getMentors().stream()
                .map(MentorDto::fromEntity)
                .toList();

        int limitTotal = systemSettingRepository.findById("max_student_per_slot_all_mentor_all_course")
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(40);
        int limitMentor = systemSettingRepository.findById("max_student_per_slot_per_mentor")
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(12);

        Map<String, Map<String, CourseCapacityDto.Cell>> matrix = new HashMap<>();

        for (SlotDto slot : slots) {
            Map<String, CourseCapacityDto.Cell> mentorMap = new HashMap<>();
            
            // Total slot overlaps check
            List<Enrollment> totalOverlaps = enrollmentRepository.findOverlappingEnrollmentsInSlot(slot.id(), startDate, endDate);
            int maxTotal = computeMaxConcurrentEnrollments(totalOverlaps, startDate, endDate);

            for (MentorDto mentor : mentors) {
                List<Enrollment> mentorOverlaps = enrollmentRepository.findOverlappingEnrollmentsForMentorInSlot(mentor.id(), slot.id(), startDate, endDate);
                int current = computeMaxConcurrentEnrollments(mentorOverlaps, startDate, endDate);

                boolean isFull = (current >= limitMentor) || (maxTotal >= limitTotal);

                mentorMap.put(mentor.id().toString(), new CourseCapacityDto.Cell(current, limitMentor, isFull));
            }
            matrix.put(slot.id().toString(), mentorMap);
        }

        return new CourseCapacityDto(slots, mentors, matrix);
    }

    private int computeMaxConcurrentEnrollments(List<Enrollment> enrollments, LocalDate start, LocalDate end) {
        Set<LocalDate> datesToCheck = new HashSet<>();
        datesToCheck.add(start);
        datesToCheck.add(end);
        for (Enrollment e : enrollments) {
            if (e.getMentorSchedule() != null) {
                LocalDate eStart = e.getMentorSchedule().getStartDate();
                LocalDate eEnd = e.getMentorSchedule().getEndDate();
                if (!eStart.isBefore(start) && !eStart.isAfter(end)) {
                    datesToCheck.add(eStart);
                }
                if (!eEnd.isBefore(start) && !eEnd.isAfter(end)) {
                    datesToCheck.add(eEnd);
                }
            }
        }

        int maxConcurrent = 0;
        for (LocalDate date : datesToCheck) {
            int count = 0;
            for (Enrollment e : enrollments) {
                if (e.getMentorSchedule() != null) {
                    LocalDate eStart = e.getMentorSchedule().getStartDate();
                    LocalDate eEnd = e.getMentorSchedule().getEndDate();
                    if (!date.isBefore(eStart) && !date.isAfter(eEnd)) {
                        count++;
                    }
                }
            }
            if (count > maxConcurrent) {
                maxConcurrent = count;
            }
        }
        return maxConcurrent;
    }
}

