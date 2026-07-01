package cc.genlab.genlablaunchpadlmsapi.model.dto.request;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {
    private String role;
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
    private String paymentType;
    private UUID registeredCourseId;
    private UUID assignedMentorId;
    private UUID timeSlotId;
    private LocalDate startDate;
    private LocalDate endDate;
    private java.math.BigDecimal totalAmount;
    private String profilePhotoKey;
    private Boolean termsAccepted;
}
