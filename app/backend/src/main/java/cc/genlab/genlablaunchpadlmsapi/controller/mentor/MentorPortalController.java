package cc.genlab.genlablaunchpadlmsapi.controller.mentor;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.MentorScheduleDto;
import cc.genlab.genlablaunchpadlmsapi.service.MentorService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mentor")
@RequiresRole("mentor")
@RequiredArgsConstructor
public class MentorPortalController {

    private final MentorService mentorService;

    @GetMapping("/dashboard")
    public MessageResponse dashboard() {
        return new MessageResponse("Welcome mentor");
    }

    @GetMapping("/profile")
    public MentorDto profile(HttpServletRequest request) {
        String userIdStr = (String) request.getAttribute("userId");
        return mentorService.getMentorProfile(userIdStr);
    }

    @GetMapping("/slots")
    public List<MentorScheduleDto> getSlots(
            HttpServletRequest request,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String userIdStr = (String) request.getAttribute("userId");
        return mentorService.getMentorSchedules(userIdStr, date, startDate, endDate);
    }
}
