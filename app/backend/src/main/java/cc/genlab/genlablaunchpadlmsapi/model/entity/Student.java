package cc.genlab.genlablaunchpadlmsapi.model.entity;

import cc.genlab.genlablaunchpadlmsapi.model.enums.StudentType;
import cc.genlab.genlablaunchpadlmsapi.model.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "students_t")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(name = "gender")
    private Gender gender;

    @Column(name = "personal_mobile")
    private String personalMobile;

    @Column(name = "emergency_mobile")
    private String emergencyMobile;

    @Column(name = "address")
    private String address;

    @Column(name = "address_proof_key")
    private String addressProofKey;

    @Column(name = "institution_name")
    private String institutionName;

    @Column(name = "student_type")
    private StudentType studentType;

    @Column(name = "referral_source")
    private String referralSource;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Enrollment> enrollments = new ArrayList<>();

    @Column(name = "profile_photo_key")
    private String profilePhotoKey;

    @Column(name = "terms_accepted")
    @Builder.Default
    private Boolean termsAccepted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
