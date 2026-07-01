package cc.genlab.genlablaunchpadlmsapi.service.port;

import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateSlotRequest;

import java.util.List;
import java.util.UUID;

/**
 * Port interface for slot domain operations.
 */
public interface SlotServicePort {

    List<SlotDto> getAllSlots();

    SlotDto getSlotById(UUID id);

    SlotDto createSlot(CreateSlotRequest request);

    SlotDto updateSlot(UUID id, CreateSlotRequest request);

    void deleteSlot(UUID id);
}
