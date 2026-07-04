package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.entity.SystemSetting;
import cc.genlab.genlablaunchpadlmsapi.repository.SystemSettingRepository;
import cc.genlab.genlablaunchpadlmsapi.service.port.SettingsServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manages system-level admin settings (key-value pairs).
 * Extracted from AdminService to satisfy the Single Responsibility Principle.
 */
@Service
@RequiredArgsConstructor
public class SettingsService implements SettingsServicePort {

    private final SystemSettingRepository systemSettingRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getSettings() {
        return systemSettingRepository.findAll()
                .stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
    }

    @Override
    @Transactional
    public void updateSettings(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            SystemSetting setting = systemSettingRepository.findById(entry.getKey())
                    .orElse(new SystemSetting(entry.getKey(), entry.getValue(), OffsetDateTime.now()));
            setting.setValue(entry.getValue());
            setting.setUpdatedAt(OffsetDateTime.now());
            systemSettingRepository.save(setting);
        }
    }
}
