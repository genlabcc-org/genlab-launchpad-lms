package cc.genlab.genlablaunchpadlmsapi.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum StudentType {
    STUDENT("student"),
    FRESHER("fresher"),
    PROFESSIONAL("professional");

    private final String value;

    StudentType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static StudentType fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        
        for (StudentType b : StudentType.values()) {
            if (b.value.equalsIgnoreCase(text)) {
                return b;
            }
        }
        
        // Fallback matching to handle UI labels
        String lower = text.toLowerCase();
        if (lower.contains("fresher")) {
            return FRESHER;
        }
        if (lower.contains("professional")) {
            return PROFESSIONAL;
        }
        if (lower.contains("student")) {
            return STUDENT;
        }

        throw new IllegalArgumentException("Unknown student type: " + text);
    }
}
