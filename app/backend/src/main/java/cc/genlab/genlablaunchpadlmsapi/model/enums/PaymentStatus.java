package cc.genlab.genlablaunchpadlmsapi.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentStatus {
    PENDING("pending"),
    COMPLETED("completed"),
    FAILED("failed"),
    REFUNDED("refunded");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static PaymentStatus fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        for (PaymentStatus p : PaymentStatus.values()) {
            if (p.value.equalsIgnoreCase(text) || p.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                return p;
            }
        }
        throw new IllegalArgumentException("Unknown payment status: " + text);
    }
}
