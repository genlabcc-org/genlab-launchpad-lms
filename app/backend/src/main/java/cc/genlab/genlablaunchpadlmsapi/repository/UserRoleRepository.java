package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    Optional<UserRole> findByUserId(UUID userId);
}
