package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    java.util.Optional<Student> findByPhone(String phone);
    java.util.Optional<Student> findByEmail(String email);
}
