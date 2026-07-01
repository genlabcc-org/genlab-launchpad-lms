package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.PresignedUrlResponse;
import cc.genlab.genlablaunchpadlmsapi.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@RequiresRole("admin")
public class AdminAssetController {

    private final StorageService storageService;

    @GetMapping("/student/profile-photo/presign-upload")
    public PresignedUrlResponse getProfilePhotoUploadUrl(
            @RequestParam(value = "contentType", defaultValue = "image/jpeg") String contentType) {
        return storageService.getPresignedUploadDetails("profile-photos", contentType);
    }

    @GetMapping("/student/address-proof/presign-upload")
    public PresignedUrlResponse getAddressProofUploadUrl(
            @RequestParam(value = "contentType", defaultValue = "image/jpeg") String contentType) {
        return storageService.getPresignedUploadDetails("address-proofs", contentType);
    }
}
