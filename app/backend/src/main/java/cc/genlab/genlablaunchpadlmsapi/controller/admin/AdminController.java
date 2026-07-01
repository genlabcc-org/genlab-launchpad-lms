package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.response.MessageResponse;
import org.springframework.web.bind.annotation.*;

/**
 * Admin dashboard endpoint. Stripped to a single responsibility.
 */
@RestController
@RequestMapping("/api/admin")
@RequiresRole("admin")
public class AdminController {

    @GetMapping("/dashboard")
    public MessageResponse dashboard() {
        return new MessageResponse("Welcome admin");
    }
}
