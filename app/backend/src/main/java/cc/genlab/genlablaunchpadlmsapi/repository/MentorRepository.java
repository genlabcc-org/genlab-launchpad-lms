package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface MentorRepository extends JpaRepository<Mentor, UUID> {
    Optional<Mentor> findByEmail(String email);
}
