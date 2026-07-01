package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStudentRequest {
    private String name;
    private String email;
    private String phone;
    private String gender;
    private String personalMobile;
    private String emergencyMobile;
    private String address;
    private String addressProofKey;
    private String institutionName;
    private String studentType;
    private String referralSource;
    private String profilePhotoKey;
    private Boolean termsAccepted;

    // Enrollment updates (optional)
    private UUID registeredCourseId;
    private UUID assignedMentorId;
    private UUID timeSlotId;
    private LocalDate startDate;
    private LocalDate endDate;
    private java.math.BigDecimal totalAmount;
    private String paymentType;
    private String enrollmentStatus;
}
