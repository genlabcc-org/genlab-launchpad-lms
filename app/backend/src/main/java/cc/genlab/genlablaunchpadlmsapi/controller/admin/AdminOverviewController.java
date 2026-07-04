package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.WorkspaceOverviewDto;
import cc.genlab.genlablaunchpadlmsapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/overview")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminOverviewController {

    private final SlotRepository slotRepository;
    private final CourseRepository courseRepository;
    private final MentorRepository mentorRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;

    @GetMapping("/counts")
    public WorkspaceOverviewDto getCounts() {
        return new WorkspaceOverviewDto(
            slotRepository.count(),
            courseRepository.count(),
            mentorRepository.count(),
            batchRepository.count(),
            studentRepository.count()
        );
    }
}
