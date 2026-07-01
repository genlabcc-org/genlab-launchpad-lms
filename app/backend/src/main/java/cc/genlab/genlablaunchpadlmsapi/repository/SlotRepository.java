package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SlotRepository extends JpaRepository<Slot, UUID> {
}
