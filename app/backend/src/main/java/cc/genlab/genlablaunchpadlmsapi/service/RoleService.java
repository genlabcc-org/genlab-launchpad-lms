package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final UserRoleRepository userRoleRepository;

    @Cacheable(value = "userRoles", key = "#userId")
    public String getRoleForUser(String userId) {
        if (userId == null) {
            return null;
        }
        try {
            UUID userUuid = UUID.fromString(userId);
            return userRoleRepository.findByUserId(userUuid)
                    .map(ur -> ur.getRole().toLowerCase())
                    .orElse(null);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @CacheEvict(value = "userRoles", key = "#userId")
    public void evictRoleCache(String userId) {
        // Method body empty, CacheEvict handles cache clearing
    }
}
