package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorScheduleDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateMentorRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;
import cc.genlab.genlablaunchpadlmsapi.service.port.MentorServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Admin CRUD for mentors. Single service dependency — MentorServicePort owns
 * all validation, Supabase interactions, and persistence.
 */
@RestController
@RequestMapping("/api/admin/mentors")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminMentorController {

    private final MentorServicePort mentorService;

    @GetMapping
    public List<MentorDto> getAllMentors() {
        return mentorService.getAllMentors();
    }

    @GetMapping("/{id}")
    public MentorDto getMentorById(@PathVariable UUID id) {
        return mentorService.getMentorProfile(id.toString());
    }

    @GetMapping("/{id}/slots")
    public List<MentorScheduleDto> getMentorSchedules(
            @PathVariable UUID id,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return mentorService.getMentorSchedules(id.toString(), date, startDate, endDate);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateUserResponse createMentor(@RequestBody CreateUserRequest request) {
        return mentorService.createMentor(request);
    }

    @PutMapping("/{id}")
    public MentorDto updateMentor(@PathVariable UUID id, @RequestBody UpdateMentorRequest request) {
        return mentorService.updateMentor(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMentor(@PathVariable UUID id) {
        mentorService.deleteMentor(id);
    }
}

