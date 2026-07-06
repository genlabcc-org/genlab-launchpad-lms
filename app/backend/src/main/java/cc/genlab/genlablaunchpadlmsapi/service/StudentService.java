package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentEnrollmentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.PaymentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentScheduleDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateStudentRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;
import cc.genlab.genlablaunchpadlmsapi.model.entity.*;
import cc.genlab.genlablaunchpadlmsapi.model.enums.*;
import cc.genlab.genlablaunchpadlmsapi.repository.*;
import cc.genlab.genlablaunchpadlmsapi.service.port.StudentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentService implements StudentServicePort {

    private final StudentRepository studentRepository;
    private final StorageService storageService;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final SupabaseAuthService supabaseAuthService;
    private final RoleService roleService;
    private final CourseRepository courseRepository;
    private final MentorRepository mentorRepository;
    private final SlotRepository slotRepository;
    private final MentorScheduleRepository mentorScheduleRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final BatchRepository batchRepository;

    // ── Read operations ──────────────────────────────────────────────────

    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(student -> {
                    String photoUrl = student.getProfilePhotoKey() != null ? storageService.resolveCdnUrl(student.getProfilePhotoKey()) : null;
                    String proofUrl = student.getAddressProofKey() != null ? storageService.generatePresignedDownloadUrl(student.getAddressProofKey()) : null;
                    return StudentDto.fromEntity(student, photoUrl, proofUrl);
                })
                .toList();
    }

    /**
     * Retrieves the profile of a student by their user ID string.
     */
    public StudentDto getStudentProfile(String userIdStr) {
        if (userIdStr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        try {
            UUID userId = UUID.fromString(userIdStr);
            Student student = studentRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));

            String photoUrl = student.getProfilePhotoKey() != null
                    ? storageService.resolveCdnUrl(student.getProfilePhotoKey())
                    : null;
            String proofUrl = student.getAddressProofKey() != null
                    ? storageService.generatePresignedDownloadUrl(student.getAddressProofKey())
                    : null;

            return StudentDto.fromEntity(student, photoUrl, proofUrl);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID format");
        }
    }

    public StudentEnrollmentDto getCurrentEnrollment(String userIdStr) {
        if (userIdStr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        UUID studentId;
        try {
            studentId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID format");
        }

        // Find the latest active enrollment
        List<Enrollment> enrollments =
                enrollmentRepository.findByStudentIdAndStatus(studentId, "active");
        if (enrollments.isEmpty()) {
            return null; // Return null when there is no active enrollment
        }

        // Sort by createdAt descending to pick the newest one
        Enrollment enrollment = enrollments.stream()
                .sorted((e1, e2) -> e2.getCreatedAt().compareTo(e1.getCreatedAt()))
                .findFirst()
                .get();

        return mapToStudentEnrollmentDto(enrollment);
    }

    public List<StudentEnrollmentDto> getPastEnrollments(String userIdStr) {
        if (userIdStr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        UUID studentId;
        try {
            studentId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID format");
        }

        // Find all past/completed enrollments (status != 'active')
        List<Enrollment> enrollments =
                enrollmentRepository.findByStudentIdAndStatusNot(studentId, "active");

        return enrollments.stream()
                .sorted((e1, e2) -> e2.getCreatedAt().compareTo(e1.getCreatedAt()))
                .map(this::mapToStudentEnrollmentDto)
                .toList();
    }

    // ── Write operations (moved from AdminService) ───────────────────────

    @Transactional
    public CreateUserResponse createStudent(CreateUserRequest request) {
        // Validation — owned by the service, not the controller
        String name = request.getName();
        String phone = request.getPhone();
        String email = request.getEmail();

        if (name == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        if (phone == null || !phone.startsWith("+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone starting with + is required for student");
        }

        // Build Supabase body
        Map<String, Object> supabaseBody = new HashMap<>();
        supabaseBody.put("phone", phone);
        supabaseBody.put("phone_confirm", true);
        supabaseBody.put("user_metadata", Map.of("name", name));
        if (email != null) {
            supabaseBody.put("email", email);
        }

        UUID userId = supabaseAuthService.createUser(supabaseBody);

        // Resolve related entities
        UUID courseId = request.getRegisteredCourseId();
        UUID mentorId = request.getAssignedMentorId();
        UUID slotId = request.getTimeSlotId();
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
            boolean mentorTeachesCourse = course.getMentors().stream()
                    .anyMatch(m -> m.getId().equals(mentorId));
            if (!mentorTeachesCourse) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Selected mentor is not assigned to teach the selected course");
            }
        }

        Slot slot = null;
        if (slotId != null) {
            slot = slotRepository.findById(slotId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot not found"));
        }

        // Capacity validations
        if (slot != null && startD != null && endD != null) {
            validateCapacity(slotId, mentorId, startD, endD);
        }

        String batchId = request.getBatchId();
        if (batchId == null || batchId.isBlank()) {
            batchId = autoDetectBatchId(LocalDate.now());
        } else {
            batchId = batchId.trim().toLowerCase().replace(" ", "_");
        }

        Batch batch = batchRepository.findById(batchId).orElse(null);

        // Find or create MentorSchedule
        MentorSchedule schedule = null;
        if (mentor != null && course != null && slot != null && startD != null && endD != null) {
            schedule = getOrCreateMentorSchedule(mentor, course, slot, startD, endD, batch);
        }

        Student student = Student.builder()
                .id(userId)
                .name(name)
                .email(email)
                .phone(phone)
                .gender(Gender.fromString(request.getGender()))
                .emergencyMobile(request.getEmergencyMobile())
                .address(request.getAddress())
                .addressProofKey(request.getAddressProofKey())
                .institutionName(request.getInstitutionName())
                .studentType(StudentType.fromString(request.getStudentType()))
                .referralSource(request.getReferralSource())
                .profilePhotoKey(request.getProfilePhotoKey())
                .interestedCourseId(schedule != null ? null : (request.getInterestedCourseId() != null ? request.getInterestedCourseId() : courseId))
                .build();
        studentRepository.saveAndFlush(student);

        BigDecimal totalAmount = request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO;
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .mentorSchedule(schedule)
                .paymentType(PaymentType.fromString(request.getPaymentType()))
                .batch(batch)
                .status(schedule != null ? "active" : "pending")
                .totalAmount(totalAmount)
                .build();
        enrollmentRepository.save(enrollment);

        return CreateUserResponse.builder()
                .userId(userId.toString())
                .role("student")
                .name(name)
                .message("User created successfully in Supabase and local DB")
                .build();
    }

    @Transactional
    public StudentDto updateStudent(UUID id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // 1. Evict Role Cache
        roleService.evictRoleCache(id.toString());

        // 2. Update fields in Supabase if name/email/phone change
        boolean supabaseUpdateNeeded = false;
        Map<String, Object> supabaseBody = new HashMap<>();
        Map<String, Object> userMetadata = new HashMap<>();

        if (request.getName() != null && !request.getName().equals(student.getName())) {
            student.setName(request.getName());
            userMetadata.put("name", request.getName());
            supabaseUpdateNeeded = true;
        }
        if (request.getEmail() != null && !request.getEmail().equals(student.getEmail())) {
            student.setEmail(request.getEmail());
            supabaseBody.put("email", request.getEmail());
            supabaseBody.put("email_confirm", true);
            supabaseUpdateNeeded = true;
        }
        if (request.getPhone() != null && !request.getPhone().equals(student.getPhone())) {
            if (!request.getPhone().startsWith("+")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "phone starting with + is required for student");
            }
            student.setPhone(request.getPhone());
            supabaseBody.put("phone", request.getPhone());
            supabaseBody.put("phone_confirm", true);
            supabaseUpdateNeeded = true;
        }

        if (supabaseUpdateNeeded) {
            if (!userMetadata.isEmpty()) {
                supabaseBody.put("user_metadata", userMetadata);
            }
            supabaseAuthService.updateUser(id, supabaseBody);
        }

        // 3. Update local Student properties
        if (request.getGender() != null) {
            student.setGender(Gender.fromString(request.getGender()));
        }
        if (request.getEmergencyMobile() != null) {
            student.setEmergencyMobile(request.getEmergencyMobile());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }
        if (request.getAddressProofKey() != null) {
            student.setAddressProofKey(request.getAddressProofKey());
        }
        if (request.getInstitutionName() != null) {
            student.setInstitutionName(request.getInstitutionName());
        }
        if (request.getStudentType() != null) {
            student.setStudentType(StudentType.fromString(request.getStudentType()));
        }
        if (request.getReferralSource() != null) {
            student.setReferralSource(request.getReferralSource());
        }
        if (request.getProfilePhotoKey() != null) {
            student.setProfilePhotoKey(request.getProfilePhotoKey());
        }
        if (request.getInterestedCourseId() != null) {
            student.setInterestedCourseId(request.getInterestedCourseId());
        }

        studentRepository.save(student);

        // 4. Update active enrollment details if provided
        boolean hasEnrollmentUpdates = request.getRegisteredCourseId() != null
                || request.getAssignedMentorId() != null
                || request.getTimeSlotId() != null
                || request.getStartDate() != null
                || request.getEndDate() != null
                || request.getTotalAmount() != null
                || request.getPaymentType() != null
                || request.getEnrollmentStatus() != null;

        if (hasEnrollmentUpdates) {
            updateStudentEnrollment(student, id, request);
        }

        // Return updated student DTO
        String photoUrl = student.getProfilePhotoKey() != null ? storageService.resolveCdnUrl(student.getProfilePhotoKey()) : null;
        String proofUrl = student.getAddressProofKey() != null ? storageService.generatePresignedDownloadUrl(student.getAddressProofKey()) : null;
        return StudentDto.fromEntity(student, photoUrl, proofUrl);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // 1. Evict Role Cache
        roleService.evictRoleCache(id.toString());

        // 2. Delete from Supabase Auth
        supabaseAuthService.deleteUser(id);

        // 3. Delete student from local DB
        studentRepository.delete(student);
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private void updateStudentEnrollment(Student student, UUID studentId, UpdateStudentRequest request) {
        // Find the active enrollment
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndStatus(studentId, "active").stream()
                .max((e1, e2) -> e1.getCreatedAt().compareTo(e2.getCreatedAt()))
                .orElse(null);

        if (enrollment == null) {
            // If no active enrollment exists and complete details are provided, build/create a new active enrollment.
            if (request.getRegisteredCourseId() != null && request.getAssignedMentorId() != null &&
                    request.getTimeSlotId() != null && request.getStartDate() != null && request.getEndDate() != null &&
                    request.getPaymentType() != null) {

                UUID courseId = request.getRegisteredCourseId();
                UUID mentorId = request.getAssignedMentorId();
                UUID slotId = request.getTimeSlotId();
                LocalDate startD = request.getStartDate();
                LocalDate endD = request.getEndDate();

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

                String batchId = request.getBatchId();
                if (batchId == null || batchId.isBlank()) {
                    LocalDate onboardDate = student.getCreatedAt() != null ? student.getCreatedAt().toLocalDate() : LocalDate.now();
                    batchId = autoDetectBatchId(onboardDate);
                } else {
                    batchId = batchId.trim().toLowerCase().replace(" ", "_");
                }
                Batch batch = batchRepository.findById(batchId).orElse(null);

                // Find or create schedule
                MentorSchedule schedule = getOrCreateMentorSchedule(mentor, course, slot, startD, endD, batch);

                BigDecimal totalAmount = request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO;
                String status = request.getEnrollmentStatus() != null ? request.getEnrollmentStatus() : "active";
                enrollment = Enrollment.builder()
                        .student(student)
                        .mentorSchedule(schedule)
                        .paymentType(PaymentType.fromString(request.getPaymentType()))
                        .batch(batch)
                        .status(status)
                        .totalAmount(totalAmount)
                        .build();
                enrollmentRepository.save(enrollment);
                if (schedule != null) {
                    student.setInterestedCourseId(null);
                    studentRepository.save(student);
                }
            } else {
                // Try to find ANY enrollment (even if inactive/completed) to update
                Enrollment anyEnrollment = enrollmentRepository.findAll().stream()
                        .filter(e -> e.getStudent().getId().equals(studentId))
                        .max((e1, e2) -> e1.getCreatedAt().compareTo(e2.getCreatedAt()))
                        .orElse(null);
                if (anyEnrollment != null) {
                    if (request.getEnrollmentStatus() != null) {
                        anyEnrollment.setStatus(request.getEnrollmentStatus());
                    }
                    if (request.getTotalAmount() != null) {
                        anyEnrollment.setTotalAmount(request.getTotalAmount());
                    }
                    if (request.getPaymentType() != null) {
                        anyEnrollment.setPaymentType(PaymentType.fromString(request.getPaymentType()));
                    }
                    enrollmentRepository.save(anyEnrollment);
                } else {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No enrollment exists for the student to update.");
                }
            }
        } else {
            updateExistingEnrollment(enrollment, request);
        }
    }

    private void updateExistingEnrollment(Enrollment enrollment, UpdateStudentRequest request) {
        boolean scheduleChange = false;
        UUID courseId = request.getRegisteredCourseId();
        UUID mentorId = request.getAssignedMentorId();
        UUID slotId = request.getTimeSlotId();
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
            // Current schedule was null, but we are providing new schedule info
            if (courseId != null || mentorId != null || slotId != null || startD != null || endD != null) {
                scheduleChange = true;
            }
        }

        String batchId = request.getBatchId();
        if (batchId == null || batchId.isBlank()) {
            batchId = enrollment.getBatchId();
        }
        if (batchId == null || batchId.isBlank()) {
            LocalDate onboardDate = enrollment.getStudent().getCreatedAt() != null ? enrollment.getStudent().getCreatedAt().toLocalDate() : LocalDate.now();
            batchId = autoDetectBatchId(onboardDate);
        } else {
            batchId = batchId.trim().toLowerCase().replace(" ", "_");
        }
        Batch batch = batchRepository.findById(batchId).orElse(null);

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
            MentorSchedule schedule = getOrCreateMentorSchedule(mentor, course, slot, startD, endD, batch);
            enrollment.setMentorSchedule(schedule);
        }

        enrollment.setBatch(batch);

        if (request.getPaymentType() != null) {
            enrollment.setPaymentType(PaymentType.fromString(request.getPaymentType()));
        }
        if (request.getTotalAmount() != null) {
            enrollment.setTotalAmount(request.getTotalAmount());
        }
        if (request.getEnrollmentStatus() != null) {
            enrollment.setStatus(request.getEnrollmentStatus());
        }

        enrollmentRepository.save(enrollment);
    }

    private void validateCapacity(UUID slotId, UUID mentorId, LocalDate startD, LocalDate endD) {
        int limitTotal = systemSettingRepository.findById("max_student_per_slot_all_mentor_all_course")
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(40);
        int limitMentor = systemSettingRepository.findById("max_student_per_slot_per_mentor")
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(12);

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

    private MentorSchedule getOrCreateMentorSchedule(Mentor mentor, Course course, Slot slot, LocalDate startD, LocalDate endD, Batch batch) {
        List<MentorSchedule> schedules = mentorScheduleRepository.findOverlappingSchedules(mentor.getId(), slot.getId(), startD, endD);
        for (MentorSchedule ms : schedules) {
            if (ms.getCourse().getId().equals(course.getId())
                    && ms.getStartDate().equals(startD)
                    && ms.getEndDate().equals(endD)
                    && java.util.Objects.equals(ms.getBatchId(), batch != null ? batch.getId() : null)) {
                return ms;
            }
        }
        if (!schedules.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mentor is already scheduled in this slot during the overlapping dates: " + schedules.get(0).getStartDate() + " to " + schedules.get(0).getEndDate() + " for batch " + schedules.get(0).getBatchId());
        }
        MentorSchedule schedule = MentorSchedule.builder()
                .mentor(mentor)
                .course(course)
                .slot(slot)
                .startDate(startD)
                .endDate(endD)
                .batch(batch)
                .build();
        return mentorScheduleRepository.save(schedule);
    }

    private String autoDetectBatchId(LocalDate onboardDate) {
        return batchRepository.findAll().stream()
                .filter(b -> b.getCutoffDate() != null)
                .filter(b -> !onboardDate.isAfter(b.getCutoffDate()))
                .min(Comparator.comparing(Batch::getStartDate))
                .map(Batch::getId)
                .orElseGet(() -> {
                    return onboardDate.isBefore(LocalDate.of(2026, 7, 15)) ? "2026_july_batch_1" : "2026_july_batch_2";
                });
    }

    private StudentEnrollmentDto mapToStudentEnrollmentDto(Enrollment enrollment) {
        // Resolve Certificate Download URL if key is present
        String certUrl = null;
        if (enrollment.getCertificateKey() != null) {
            certUrl = storageService.resolveCdnUrl(enrollment.getCertificateKey());
        }

        // Map Course Dto (including syllabus)
        CourseDto courseDto = null;
        StudentScheduleDto scheduleDto = null;
        if (enrollment.getMentorSchedule() != null) {
            Course course = enrollment.getMentorSchedule().getCourse();
            courseDto = CourseDto.fromEntity(course);

            scheduleDto = new StudentScheduleDto(
                    enrollment.getMentorSchedule().getId(),
                    SlotDto.fromEntity(enrollment.getMentorSchedule().getSlot()),
                    MentorDto.fromEntity(enrollment.getMentorSchedule().getMentor()),
                    enrollment.getMentorSchedule().getStartDate(),
                    enrollment.getMentorSchedule().getEndDate(),
                    enrollment.getMentorSchedule().getBatchId()
            );
        }

        // Fetch and map payments
        List<PaymentDto> payments = paymentRepository.findByEnrollmentId(enrollment.getId()).stream()
                .map(PaymentDto::fromEntity)
                .toList();

        BigDecimal totalPaid = payments.stream()
                .filter(p -> p.status() == cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentStatus.COMPLETED)
                .map(p -> p.amount() != null ? p.amount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));
        BigDecimal pendingAmount = enrollment.getTotalAmount().subtract(totalPaid);

        return new StudentEnrollmentDto(
                enrollment.getId(),
                enrollment.getStatus(),
                enrollment.getPaymentType() != null ? enrollment.getPaymentType().toString() : null,
                enrollment.getTotalAmount(),
                pendingAmount.compareTo(BigDecimal.ZERO) > 0 ? pendingAmount : BigDecimal.ZERO,
                courseDto,
                scheduleDto,
                payments,
                certUrl,
                enrollment.getBatchId(),
                enrollment.getCreatedAt()
        );
    }
}
