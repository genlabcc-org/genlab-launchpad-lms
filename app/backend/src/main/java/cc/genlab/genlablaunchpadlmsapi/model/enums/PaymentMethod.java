package cc.genlab.genlablaunchpadlmsapi.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentMethod {
    CASH("cash"),
    CARD("card"),
    BANK_TRANSFER("bank transfer"),
    UPI("upi"),
    OTHER("other");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
      }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static PaymentMethod fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        for (PaymentMethod p : PaymentMethod.values()) {
            if (p.value.equalsIgnoreCase(text) || p.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                return p;
            }
        }
        throw new IllegalArgumentException("Unknown payment method: " + text);
    }
}
