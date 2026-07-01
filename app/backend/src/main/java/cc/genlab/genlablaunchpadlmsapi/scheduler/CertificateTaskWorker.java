package cc.genlab.genlablaunchpadlmsapi.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CertificateTaskWorker {

    private final CertificateTaskProcessor taskProcessor;

    @Scheduled(fixedDelay = 2000)
    public void pollTasks() {
        try {
            while (taskProcessor.processNextTask()) {
                // Continue fetching and processing as long as there are pending tasks in queue
            }
        } catch (Exception e) {
            log.error("Error occurred in certificate queue task polling loop", e);
        }
    }
}
