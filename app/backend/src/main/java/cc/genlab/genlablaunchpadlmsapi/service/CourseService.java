package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.CourseDto;
import cc.genlab.genlablaunchpadlmsapi.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(CourseDto::fromEntity)
                .toList();
    }
}
