package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorScheduleDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateUserRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.UpdateMentorRequest;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.CreateUserResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Port interface for mentor domain operations.
 * Controllers depend on this interface, not the concrete MentorService.
 */
public interface MentorServicePort {

    List<MentorDto> getAllMentors();

    MentorDto getMentorProfile(String userIdStr);

    List<MentorScheduleDto> getMentorSchedules(String userIdStr, LocalDate date, LocalDate startDate, LocalDate endDate);

    CreateUserResponse createMentor(CreateUserRequest request);

    MentorDto updateMentor(UUID id, UpdateMentorRequest request);

    void deleteMentor(UUID id);
}
