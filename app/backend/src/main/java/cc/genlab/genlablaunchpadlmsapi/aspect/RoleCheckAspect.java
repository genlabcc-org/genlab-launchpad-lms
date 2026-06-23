package cc.genlab.genlablaunchpadlmsapi.aspect;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.service.RoleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
@RequiredArgsConstructor
public class RoleCheckAspect {

    private final RoleService roleService;

    @Before("@annotation(requiresRole)")
    public void checkRole(JoinPoint joinPoint, RequiresRole requiresRole) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No active request context found");
        }

        HttpServletRequest request = attrs.getRequest();
        String userId = (String) request.getAttribute("userId");

        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String userRole = roleService.getRoleForUser(userId);

        if (userRole == null || !userRole.equalsIgnoreCase(requiresRole.value())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access denied. Required role: " + requiresRole.value().toLowerCase() + ", actual role: " + (userRole != null ? userRole : "none"));
        }
    }
}
