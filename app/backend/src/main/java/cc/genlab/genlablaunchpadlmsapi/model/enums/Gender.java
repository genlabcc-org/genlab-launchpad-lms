package cc.genlab.genlablaunchpadlmsapi.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Gender {
    MALE("male"),
    FEMALE("female"),
    NON_BINARY("non-binary");

    private final String value;

    Gender(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static Gender fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        for (Gender g : Gender.values()) {
            if (g.value.equalsIgnoreCase(text) || g.name().equalsIgnoreCase(text.replace("-", "_").replace(" ", "_"))) {
                return g;
            }
        }
        // Fallbacks
        String lower = text.toLowerCase();
        if (lower.contains("female")) {
            return FEMALE;
        }
        if (lower.contains("male")) {
            return MALE;
        }
        if (lower.contains("binary") || lower.contains("non")) {
            return NON_BINARY;
        }
        throw new IllegalArgumentException("Unknown gender: " + text);
    }
}
