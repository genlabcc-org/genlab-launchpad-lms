package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Student;
import cc.genlab.genlablaunchpadlmsapi.model.enums.StudentType;
import cc.genlab.genlablaunchpadlmsapi.model.enums.Gender;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Enrollment;
import cc.genlab.genlablaunchpadlmsapi.model.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentDto(
    UUID id,
    String name,
    String email,
    String phone,
    Gender gender,
    String personalMobile,
    String emergencyMobile,
    String address,
    String addressProofKey,
    String addressProofUrl,
    String institutionName,
    StudentType studentType,
    String referralSource,
    PaymentType paymentType,
    UUID registeredCourseId,
    UUID assignedMentorId,
    UUID timeSlotId,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal totalAmount,
    BigDecimal pendingAmount,
    String profilePhotoKey,
    String profilePhotoUrl,
    Boolean termsAccepted,
    OffsetDateTime createdAt
) {
    public static StudentDto fromEntity(Student student, String profilePhotoUrl, String addressProofUrl) {
        Enrollment latestEnrollment = student.getEnrollments() != null ? student.getEnrollments().stream()
                .filter(e -> "active".equalsIgnoreCase(e.getStatus()))
                .max((e1, e2) -> e1.getCreatedAt().compareTo(e2.getCreatedAt()))
                .orElse(student.getEnrollments().stream()
                        .max((e1, e2) -> e1.getCreatedAt().compareTo(e2.getCreatedAt()))
                        .orElse(null))
                : null;

        return new StudentDto(
            student.getId(),
            student.getName(),
            student.getEmail(),
            student.getPhone(),
            student.getGender(),
            student.getPersonalMobile(),
            student.getEmergencyMobile(),
            student.getAddress(),
            student.getAddressProofKey(),
            addressProofUrl,
            student.getInstitutionName(),
            student.getStudentType(),
            student.getReferralSource(),
            latestEnrollment != null ? latestEnrollment.getPaymentType() : null,
            latestEnrollment != null && latestEnrollment.getMentorSchedule() != null && latestEnrollment.getMentorSchedule().getCourse() != null ? latestEnrollment.getMentorSchedule().getCourse().getId() : null,
            latestEnrollment != null && latestEnrollment.getMentorSchedule() != null && latestEnrollment.getMentorSchedule().getMentor() != null ? latestEnrollment.getMentorSchedule().getMentor().getId() : null,
            latestEnrollment != null && latestEnrollment.getMentorSchedule() != null && latestEnrollment.getMentorSchedule().getSlot() != null ? latestEnrollment.getMentorSchedule().getSlot().getId() : null,
            latestEnrollment != null && latestEnrollment.getMentorSchedule() != null ? latestEnrollment.getMentorSchedule().getStartDate() : null,
            latestEnrollment != null && latestEnrollment.getMentorSchedule() != null ? latestEnrollment.getMentorSchedule().getEndDate() : null,
            latestEnrollment != null ? latestEnrollment.getTotalAmount() : java.math.BigDecimal.ZERO,
            latestEnrollment != null ? latestEnrollment.getPendingAmount() : java.math.BigDecimal.ZERO,
            student.getProfilePhotoKey(),
            profilePhotoUrl,
            student.getTermsAccepted(),
            student.getCreatedAt()
        );
    }
}
