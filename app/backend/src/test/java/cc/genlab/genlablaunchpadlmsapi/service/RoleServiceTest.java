package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.entity.UserRole;
import cc.genlab.genlablaunchpadlmsapi.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock
    private UserRoleRepository userRoleRepository;

    @InjectMocks
    private RoleService roleService;

    @Test
    void getRoleForUser_whenUserExists_shouldReturnRole() {
        // Arrange
        UUID userId = UUID.randomUUID();
        UserRole userRole = UserRole.builder()
                .userId(userId)
                .role("ADMIN")
                .build();
        when(userRoleRepository.findByUserId(userId)).thenReturn(Optional.of(userRole));

        // Act
        String result = roleService.getRoleForUser(userId.toString());

        // Assert
        assertThat(result).isEqualTo("admin");
    }

    @Test
    void getRoleForUser_whenUserDoesNotExist_shouldReturnNull() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(userRoleRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // Act
        String result = roleService.getRoleForUser(userId.toString());

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void getRoleForUser_whenUserIdIsNull_shouldReturnNull() {
        // Act
        String result = roleService.getRoleForUser(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void getRoleForUser_whenUserIdIsInvalid_shouldReturnNull() {
        // Act
        String result = roleService.getRoleForUser("invalid-uuid");

        // Assert
        assertThat(result).isNull();
    }
}
