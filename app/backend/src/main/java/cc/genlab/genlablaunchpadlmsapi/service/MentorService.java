package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorScheduleDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateMentorRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Mentor;
import cc.genlab.genlablaunchpadlmsapi.model.entity.MentorSchedule;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Enrollment;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Student;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorScheduleRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.EnrollmentRepository;
import cc.genlab.genlablaunchpadlmsapi.service.port.MentorServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MentorService implements MentorServicePort {

    private final MentorRepository mentorRepository;
    private final MentorScheduleRepository mentorScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StorageService storageService;
    private final SupabaseAuthService supabaseAuthService;
    private final RoleService roleService;

    // ── Read operations ──────────────────────────────────────────────────

    /**
     * Retrieves all mentors from the repository.
     */
    @Transactional(readOnly = true)
    public List<MentorDto> getAllMentors() {
        return mentorRepository.findAll().stream()
                .map(MentorDto::fromEntity)
                .toList();
    }

    /**
     * Retrieves the profile of a mentor by their user ID string.
     */
    @Transactional(readOnly = true)
    public MentorDto getMentorProfile(String userIdStr) {
        if (userIdStr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        try {
            UUID userId = UUID.fromString(userIdStr);
            Mentor mentor = mentorRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mentor profile not found"));
            return MentorDto.fromEntity(mentor);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID format");
        }
    }

    /**
     * Retrieves all scheduled slots for a mentor over a given date range (or
     * default bulk window).
     */
    @Transactional(readOnly = true)
    public List<MentorScheduleDto> getMentorSchedules(String userIdStr, LocalDate date, LocalDate startDate,
            LocalDate endDate) {
        if (userIdStr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        UUID mentorId;
        try {
            mentorId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID format");
        }

        LocalDate start;
        LocalDate end;

        if (startDate != null && endDate != null) {
            start = startDate;
            end = endDate;
        } else {
            LocalDate baseDate = date != null ? date : LocalDate.now();
            start = baseDate.minusDays(10);
            end = baseDate.plusDays(15);
        }

        List<MentorSchedule> schedules = mentorScheduleRepository.findOverlappingSchedulesForMentor(mentorId, start,
                end);
        if (schedules.isEmpty()) {
            return List.of();
        }

        List<UUID> scheduleIds = schedules.stream()
                .filter(Objects::nonNull)
                .map(ms -> ms.getId())
                .toList();
        List<Enrollment> enrollments = enrollmentRepository.findActiveEnrollmentsForSchedules(scheduleIds);

        // Group active students by schedule ID
        Map<UUID, List<StudentDto>> scheduleStudentsMap = new HashMap<>();
        for (Enrollment enrollment : enrollments) {
            if (enrollment.getStudent() != null) {
                Student student = enrollment.getStudent();
                String photoUrl = student.getProfilePhotoKey() != null
                        ? storageService.resolveCdnUrl(student.getProfilePhotoKey())
                        : null;
                String proofUrl = null;

                StudentDto studentDto = StudentDto.fromEntity(student, photoUrl, proofUrl);
                scheduleStudentsMap.computeIfAbsent(enrollment.getMentorSchedule().getId(), k -> new ArrayList<>())
                        .add(studentDto);
            }
        }

        return schedules.stream()
                .map(ms -> new MentorScheduleDto(
                        ms.getId(),
                        SlotDto.fromEntity(ms.getSlot()),
                        CourseDto.fromEntity(ms.getCourse()),
                        MentorDto.fromEntity(ms.getMentor()),
                        ms.getStartDate(),
                        ms.getEndDate(),
                        ms.getBatchId(),
                        scheduleStudentsMap.getOrDefault(ms.getId(), List.of())))
                .toList();
    }

    // ── Write operations (moved from AdminService) ───────────────────────

    @Transactional
    public CreateUserResponse createMentor(CreateUserRequest request) {
        // Validation — owned by the service, not the controller
        String name = request.getName();
        String email = request.getEmail();

        if (name == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        if (email == null || !email.toLowerCase().endsWith(".genlab@gmail.com")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email ending in .genlab@gmail.com is required for mentor");
        }

        // Build Supabase body
        Map<String, Object> supabaseBody = new HashMap<>();
        supabaseBody.put("email", email);
        supabaseBody.put("email_confirm", true);
        supabaseBody.put("user_metadata", Map.of("name", name));

        UUID userId = supabaseAuthService.createUser(supabaseBody);

        Mentor mentor = Mentor.builder()
                .id(userId)
                .name(name)
                .email(email)
                .build();
        mentorRepository.saveAndFlush(mentor);

        return CreateUserResponse.builder()
                .userId(userId.toString())
                .role("mentor")
                .name(name)
                .message("User created successfully in Supabase and local DB")
                .build();
    }

    @Transactional
    public MentorDto updateMentor(UUID id, UpdateMentorRequest request) {
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mentor not found"));

        // 1. Evict Role Cache
        roleService.evictRoleCache(id.toString());

        // 2. Update fields in Supabase if name/email change
        boolean supabaseUpdateNeeded = false;
        Map<String, Object> supabaseBody = new HashMap<>();
        Map<String, Object> userMetadata = new HashMap<>();

        if (request.getName() != null && !request.getName().equals(mentor.getName())) {
            mentor.setName(request.getName());
            userMetadata.put("name", request.getName());
            supabaseUpdateNeeded = true;
        }
        if (request.getEmail() != null && !request.getEmail().equals(mentor.getEmail())) {
            if (!request.getEmail().toLowerCase().endsWith(".genlab@gmail.com")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email ending in .genlab@gmail.com is required for mentor");
            }
            mentor.setEmail(request.getEmail());
            supabaseBody.put("email", request.getEmail());
            supabaseBody.put("email_confirm", true);
            supabaseUpdateNeeded = true;
        }

        if (supabaseUpdateNeeded) {
            if (!userMetadata.isEmpty()) {
                supabaseBody.put("user_metadata", userMetadata);
            }
            supabaseAuthService.updateUser(id, supabaseBody);
        }

        // 3. Update local Mentor properties
        mentorRepository.save(mentor);

        return MentorDto.fromEntity(mentor);
    }

    @Transactional
    public void deleteMentor(UUID id) {
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mentor not found"));

        // 1. Evict Role Cache
        roleService.evictRoleCache(id.toString());

        // 2. Delete from Supabase Auth
        supabaseAuthService.deleteUser(id);

        // 3. Delete mentor from local DB
        mentorRepository.delete(mentor);
    }
}
