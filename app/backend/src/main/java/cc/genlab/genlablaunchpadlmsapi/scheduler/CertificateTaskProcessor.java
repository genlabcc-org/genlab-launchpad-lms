package cc.genlab.genlablaunchpadlmsapi.scheduler;

import cc.genlab.genlablaunchpadlmsapi.service.CertificateService;
import cc.genlab.genlablaunchpadlmsapi.model.entity.CertificateGenerationTask;
import cc.genlab.genlablaunchpadlmsapi.repository.CertificateGenerationTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateTaskProcessor {

    private final CertificateGenerationTaskRepository taskRepository;
    private final CertificateService certificateService;

    @Transactional
    public boolean processNextTask() {
        Optional<CertificateGenerationTask> taskOpt = taskRepository.findNextPendingTaskForUpdate();
        if (taskOpt.isEmpty()) {
            return false;
        }

        CertificateGenerationTask task = taskOpt.get();
        task.setStatus("processing");
        task.setUpdatedAt(OffsetDateTime.now());
        taskRepository.saveAndFlush(task);

        log.info("Acquired lock and processing task: {} for enrollment: {}", task.getId(), task.getEnrollmentId());

        try {
            certificateService.generateAndUploadCertificate(task.getEnrollmentId());
            task.setStatus("completed");
            log.info("Successfully completed certificate task: {}", task.getId());
        } catch (Exception e) {
            log.error("Failed to generate certificate for task: {}", task.getId(), e);
            task.setStatus("failed");
            task.setErrorMessage(e.getMessage());
        } finally {
            task.setUpdatedAt(OffsetDateTime.now());
            taskRepository.saveAndFlush(task);
        }

        return true;
    }
}
