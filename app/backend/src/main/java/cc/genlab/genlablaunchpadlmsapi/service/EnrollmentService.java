package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.*;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.EnrollmentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.entity.*;
import cc.genlab.genlablaunchpadlmsapi.model.enums.*;
import cc.genlab.genlablaunchpadlmsapi.repository.*;
import cc.genlab.genlablaunchpadlmsapi.service.port.EnrollmentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService implements EnrollmentServicePort {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final MentorRepository mentorRepository;
    private final SlotRepository slotRepository;
    private final MentorScheduleRepository mentorScheduleRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final PaymentRepository paymentRepository;
    private final StorageService storageService;

    public List<EnrollmentDto> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::mapToEnrollmentDto)
                .toList();
    }

    public EnrollmentDto getEnrollmentById(UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
        return mapToEnrollmentDto(enrollment);
    }

    @Transactional
    public EnrollmentDto createEnrollment(EnrollmentRequest request) {
        if (request.getStudentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
        }
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        UUID courseId = request.getCourseId();
        UUID mentorId = request.getMentorId();
        UUID slotId = request.getSlotId();
        LocalDate startD = request.getStartDate();
        LocalDate endD = request.getEndDate();

        Course course = null;
        if (courseId != null) {
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course not found"));
        }

        Mentor mentor = null;
        if (mentorId != null) {
            mentor = mentorRepository.findById(mentorId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mentor not found"));
        }

        if (mentor != null && course != null) {
            if (!course.getMentors().contains(mentor)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Selected mentor is not assigned to teach the selected course");
            }
        }

        Slot slot = null;
        if (slotId != null) {
            slot = slotRepository.findById(slotId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot not found"));
        }

        // Perform Capacity Validations
        if (slot != null && startD != null && endD != null) {
            validateCapacity(slotId, mentorId, startD, endD);
        }

        // Find or Create MentorSchedule
        MentorSchedule schedule = null;
        if (mentor != null && course != null && slot != null && startD != null && endD != null) {
            schedule = getOrCreateMentorSchedule(mentor, course, slot, startD, endD);
        }

        java.math.BigDecimal totalAmount = request.getTotalAmount();
        if (totalAmount == null || totalAmount.compareTo(java.math.BigDecimal.ZERO) == 0) {
            if (course != null) {
                totalAmount = course.getPrice();
            } else {
                totalAmount = java.math.BigDecimal.ZERO;
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .mentorSchedule(schedule)
                .paymentType(request.getPaymentType() != null ? PaymentType.fromString(request.getPaymentType()) : null)
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .totalAmount(totalAmount)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return mapToEnrollmentDto(enrollment);
    }

    @Transactional
    public List<EnrollmentDto> createEnrollmentsBulk(List<EnrollmentRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        return requests.stream()
                .map(this::createEnrollment)
                .toList();
    }

    @Transactional
    public EnrollmentDto updateEnrollment(UUID id, EnrollmentRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        if (request.getStatus() != null) {
            enrollment.setStatus(request.getStatus());
        }
        if (request.getPaymentType() != null) {
            enrollment.setPaymentType(PaymentType.fromString(request.getPaymentType()));
        }
        if (request.getTotalAmount() != null) {
            enrollment.setTotalAmount(request.getTotalAmount());
        }

        // Handle scheduling updates
        boolean scheduleChange = false;
        UUID courseId = request.getCourseId();
        UUID mentorId = request.getMentorId();
        UUID slotId = request.getSlotId();
        LocalDate startD = request.getStartDate();
        LocalDate endD = request.getEndDate();

        MentorSchedule currentSchedule = enrollment.getMentorSchedule();
        if (currentSchedule != null) {
            if (courseId == null) courseId = currentSchedule.getCourse().getId();
            if (mentorId == null) mentorId = currentSchedule.getMentor().getId();
            if (slotId == null) slotId = currentSchedule.getSlot().getId();
            if (startD == null) startD = currentSchedule.getStartDate();
            if (endD == null) endD = currentSchedule.getEndDate();

            if (!courseId.equals(currentSchedule.getCourse().getId())
                    || !mentorId.equals(currentSchedule.getMentor().getId())
                    || !slotId.equals(currentSchedule.getSlot().getId())
                    || !startD.equals(currentSchedule.getStartDate())
                    || !endD.equals(currentSchedule.getEndDate())) {
                scheduleChange = true;
            }
        } else {
            if (courseId != null || mentorId != null || slotId != null || startD != null || endD != null) {
                scheduleChange = true;
            }
        }

        if (scheduleChange) {
            if (courseId == null || mentorId == null || slotId == null || startD == null || endD == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All schedule details (course, mentor, slot, start/end dates) must be provided to update schedule");
            }
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course not found"));
            Mentor mentor = mentorRepository.findById(mentorId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mentor not found"));
            if (!course.getMentors().contains(mentor)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected mentor is not assigned to teach the selected course");
            }
            Slot slot = slotRepository.findById(slotId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot not found"));

            // Capacity validations
            validateCapacity(slotId, mentorId, startD, endD);

            // Find or create schedule
            MentorSchedule schedule = getOrCreateMentorSchedule(mentor, course, slot, startD, endD);
            enrollment.setMentorSchedule(schedule);
        }

        enrollment = enrollmentRepository.save(enrollment);
        return mapToEnrollmentDto(enrollment);
    }

    @Transactional
    public void deleteEnrollment(UUID id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

    private StudentDto mapToStudentDto(Student student) {
        if (student == null) return null;
        String photoUrl = student.getProfilePhotoKey() != null ? storageService.resolveCdnUrl(student.getProfilePhotoKey()) : null;
        String proofUrl = student.getAddressProofKey() != null ? storageService.generatePresignedDownloadUrl(student.getAddressProofKey()) : null;
        return StudentDto.fromEntity(student, photoUrl, proofUrl);
    }

    public EnrollmentDto mapToEnrollmentDto(Enrollment enrollment) {
        String certUrl = null;
        if (enrollment.getCertificateKey() != null) {
            certUrl = storageService.resolveCdnUrl(enrollment.getCertificateKey());
        }

        StudentScheduleDto scheduleDto = null;
        if (enrollment.getMentorSchedule() != null) {
            scheduleDto = new StudentScheduleDto(
                    enrollment.getMentorSchedule().getId(),
                    SlotDto.fromEntity(enrollment.getMentorSchedule().getSlot()),
                    MentorDto.fromEntity(enrollment.getMentorSchedule().getMentor()),
                    enrollment.getMentorSchedule().getStartDate(),
                    enrollment.getMentorSchedule().getEndDate()
            );
        }

        List<PaymentDto> payments = paymentRepository.findByEnrollmentId(enrollment.getId()).stream()
                .map(PaymentDto::fromEntity)
                .toList();

        java.math.BigDecimal totalPaid = payments.stream()
                .filter(p -> p.status() == PaymentStatus.COMPLETED)
                .map(p -> p.amount())
                .reduce(java.math.BigDecimal.ZERO, (a, b) -> a.add(b));

        java.math.BigDecimal pendingAmount = enrollment.getTotalAmount().subtract(totalPaid);

        return new EnrollmentDto(
                enrollment.getId(),
                mapToStudentDto(enrollment.getStudent()),
                scheduleDto,
                enrollment.getStatus(),
                enrollment.getPaymentType() != null ? enrollment.getPaymentType().toString() : null,
                enrollment.getTotalAmount(),
                pendingAmount,
                payments,
                certUrl,
                enrollment.getCreatedAt()
        );
    }

    private void validateCapacity(UUID slotId, UUID mentorId, LocalDate startD, LocalDate endD) {
        int limitTotal = systemSettingRepository.findById("max_students_total")
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(50);
        int limitMentor = systemSettingRepository.findById("max_students_per_mentor")
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(30);

        // 1. Total slot capacity check
        List<Enrollment> totalOverlaps = enrollmentRepository.findOverlappingEnrollmentsInSlot(slotId, startD, endD);
        int maxTotal = computeMaxConcurrentEnrollments(totalOverlaps, startD, endD);
        if (maxTotal + 1 > limitTotal) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Enrollment limit exceeded for this slot. Total allowed: " + limitTotal + ", current peak: " + maxTotal);
        }

        // 2. Mentor capacity check
        if (mentorId != null) {
            List<Enrollment> mentorOverlaps = enrollmentRepository.findOverlappingEnrollmentsForMentorInSlot(mentorId, slotId, startD, endD);
            int maxMentor = computeMaxConcurrentEnrollments(mentorOverlaps, startD, endD);
            if (maxMentor + 1 > limitMentor) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Mentor student allotment limit exceeded for this slot. Allowed: " + limitMentor + ", current peak: " + maxMentor);
            }
        }
    }

    private int computeMaxConcurrentEnrollments(List<Enrollment> enrollments, LocalDate start, LocalDate end) {
        java.util.Set<LocalDate> datesToCheck = new java.util.HashSet<>();
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

    private MentorSchedule getOrCreateMentorSchedule(Mentor mentor, Course course, Slot slot, LocalDate startD, LocalDate endD) {
        List<MentorSchedule> schedules = mentorScheduleRepository.findOverlappingSchedules(mentor.getId(), slot.getId(), startD, endD);
        for (MentorSchedule ms : schedules) {
            if (ms.getCourse().getId().equals(course.getId())
                    && ms.getStartDate().equals(startD)
                    && ms.getEndDate().equals(endD)) {
                return ms;
            }
        }
        if (!schedules.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mentor is already scheduled in this slot during the overlapping dates: " + schedules.get(0).getStartDate() + " to " + schedules.get(0).getEndDate());
        }
        MentorSchedule schedule = MentorSchedule.builder()
                .mentor(mentor)
                .course(course)
                .slot(slot)
                .startDate(startD)
                .endDate(endD)
                .build();
        return mentorScheduleRepository.save(schedule);
    }
}
