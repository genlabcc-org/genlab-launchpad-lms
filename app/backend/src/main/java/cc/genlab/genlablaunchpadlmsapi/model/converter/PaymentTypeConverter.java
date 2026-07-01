package cc.genlab.genlablaunchpadlmsapi.model.converter;

import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentTypeConverter implements AttributeConverter<PaymentType, String> {

    @Override
    public String convertToDatabaseColumn(PaymentType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public PaymentType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        return PaymentType.fromString(dbData);
    }
}
