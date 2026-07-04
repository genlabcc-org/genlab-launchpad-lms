package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.entity.SystemSetting;
import cc.genlab.genlablaunchpadlmsapi.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SettingsServiceTest {

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @InjectMocks
    private SettingsService settingsService;

    private SystemSetting orgNameSetting;
    private SystemSetting paymentMethodSetting;

    @BeforeEach
    void setUp() {
        orgNameSetting = new SystemSetting("org.name", "PEC Developers Initiative", OffsetDateTime.now());
        paymentMethodSetting = new SystemSetting("payment.accepted_methods", "cash,upi", OffsetDateTime.now());
    }

    @Test
    void getSettings_whenSettingsExist_shouldReturnAllAsMap() {
        // Arrange
        when(systemSettingRepository.findAll()).thenReturn(List.of(orgNameSetting, paymentMethodSetting));

        // Act
        Map<String, String> result = settingsService.getSettings();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).containsEntry("org.name", "PEC Developers Initiative");
        assertThat(result).containsEntry("payment.accepted_methods", "cash,upi");
    }

    @Test
    void getSettings_whenNoSettingsExist_shouldReturnEmptyMap() {
        // Arrange
        when(systemSettingRepository.findAll()).thenReturn(List.of());

        // Act
        Map<String, String> result = settingsService.getSettings();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void updateSettings_whenKeyExists_shouldUpdateValue() {
        // Arrange
        when(systemSettingRepository.findById("org.name")).thenReturn(Optional.of(orgNameSetting));

        // Act
        settingsService.updateSettings(Map.of("org.name", "New Org Name"));

        // Assert
        assertThat(orgNameSetting.getValue()).isEqualTo("New Org Name");
        verify(systemSettingRepository, times(1)).save(orgNameSetting);
    }

    @Test
    void updateSettings_whenKeyDoesNotExist_shouldCreateNewEntry() {
        // Arrange
        when(systemSettingRepository.findById("new.key")).thenReturn(Optional.empty());

        // Act
        settingsService.updateSettings(Map.of("new.key", "new-value"));

        // Assert
        verify(systemSettingRepository, times(1)).save(any(SystemSetting.class));
    }
}
