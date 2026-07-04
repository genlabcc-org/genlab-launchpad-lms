package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import cc.genlab.genlablaunchpadlmsapi.service.port.SettingsServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin endpoint for system settings management.
 * Controller is kept thin — routing and parsing only, no business logic.
 */
@RestController
@RequestMapping("/api/admin/settings")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SettingsServicePort settingsService;

    @GetMapping
    public Map<String, String> getSettings() {
        return settingsService.getSettings();
    }

    @PutMapping
    public MessageResponse updateSettings(@RequestBody Map<String, String> body) {
        settingsService.updateSettings(body);
        return new MessageResponse("Settings updated successfully");
    }
}
