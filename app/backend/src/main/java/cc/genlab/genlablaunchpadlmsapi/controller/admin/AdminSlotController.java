package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateSlotRequest;
import cc.genlab.genlablaunchpadlmsapi.service.port.SlotServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/slots")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminSlotController {

    private final SlotServicePort slotService;

    @GetMapping
    public List<SlotDto> getAllSlots() {
        return slotService.getAllSlots();
    }

    @GetMapping("/{id}")
    public SlotDto getSlotById(@PathVariable UUID id) {
        return slotService.getSlotById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SlotDto createSlot(@RequestBody CreateSlotRequest request) {
        return slotService.createSlot(request);
    }

    @PutMapping("/{id}")
    public SlotDto updateSlot(@PathVariable UUID id, @RequestBody CreateSlotRequest request) {
        return slotService.updateSlot(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSlot(@PathVariable UUID id) {
        slotService.deleteSlot(id);
    }
}
