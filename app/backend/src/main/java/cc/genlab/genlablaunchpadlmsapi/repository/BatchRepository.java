package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BatchRepository extends JpaRepository<Batch, String> {
}
