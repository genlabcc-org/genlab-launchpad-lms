package cc.genlab.genlablaunchpadlmsapi.service.port;

import java.util.Map;

/**
 * Port interface for settings domain operations.
 */
public interface SettingsServicePort {

    void updateSettings(Map<String, String> settings);
}
