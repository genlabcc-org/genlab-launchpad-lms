package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.CertificateGenerationTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CertificateGenerationTaskRepository extends JpaRepository<CertificateGenerationTask, UUID> {

    @Query(value = "SELECT * FROM public.certificate_generation_tasks_t " +
                   "WHERE status = 'pending' " +
                   "ORDER BY created_at ASC " +
                   "LIMIT 1 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    Optional<CertificateGenerationTask> findNextPendingTaskForUpdate();

    List<CertificateGenerationTask> findByEnrollmentId(UUID enrollmentId);
}
