package cc.genlab.genlablaunchpadlmsapi.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentType {
    FULL_PAYMENT("full payment"),
    MONTHLY("monthly"),
    PARTIAL("partial");

    private final String value;

    PaymentType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static PaymentType fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        for (PaymentType p : PaymentType.values()) {
            if (p.value.equalsIgnoreCase(text) || p.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                return p;
            }
        }
        // Fallbacks
        String lower = text.toLowerCase();
        if (lower.contains("full")) {
            return FULL_PAYMENT;
        }
        if (lower.contains("monthly")) {
            return MONTHLY;
        }
        if (lower.contains("partial")) {
            return PARTIAL;
        }
        throw new IllegalArgumentException("Unknown payment type: " + text);
    }
}
