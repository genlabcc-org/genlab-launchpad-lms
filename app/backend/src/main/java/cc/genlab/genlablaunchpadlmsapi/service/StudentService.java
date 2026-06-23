package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.StudentDto;
import cc.genlab.genlablaunchpadlmsapi.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(StudentDto::fromEntity)
                .toList();
    }
}
