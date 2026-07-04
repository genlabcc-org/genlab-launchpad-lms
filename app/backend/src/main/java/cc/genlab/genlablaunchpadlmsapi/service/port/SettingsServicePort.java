package cc.genlab.genlablaunchpadlmsapi.service.port;

import java.util.Map;

/**
 * Port interface for settings domain operations.
 * Follows ISP — only two focused methods, nothing extra.
 */
public interface SettingsServicePort {

    /**
     * Returns all system settings as a key-value map.
     */
    Map<String, String> getSettings();

    /**
     * Upserts one or more settings from the given key-value map.
     */
    void updateSettings(Map<String, String> settings);
}
