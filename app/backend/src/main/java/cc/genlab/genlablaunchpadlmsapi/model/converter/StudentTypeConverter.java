package cc.genlab.genlablaunchpadlmsapi.model.converter;

import cc.genlab.genlablaunchpadlmsapi.model.enums.StudentType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StudentTypeConverter implements AttributeConverter<StudentType, String> {

    @Override
    public String convertToDatabaseColumn(StudentType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public StudentType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        return StudentType.fromString(dbData);
    }
}
