package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.SlotDto;
import cc.genlab.genlablaunchpadlmsapi.model.dto.request.CreateSlotRequest;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Slot;
import cc.genlab.genlablaunchpadlmsapi.repository.SlotRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.MentorScheduleRepository;
import cc.genlab.genlablaunchpadlmsapi.service.port.SlotServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SlotService implements SlotServicePort {

    private final SlotRepository slotRepository;
    private final MentorScheduleRepository mentorScheduleRepository;

    public List<SlotDto> getAllSlots() {
        return slotRepository.findAll().stream()
                .map(SlotDto::fromEntity)
                .toList();
    }

    public SlotDto getSlotById(UUID id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        return SlotDto.fromEntity(slot);
    }

    @Transactional
    public SlotDto createSlot(CreateSlotRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time and end time are required");
        }
        Slot slot = Slot.builder()
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        slot = slotRepository.save(slot);
        return SlotDto.fromEntity(slot);
    }

    @Transactional
    public SlotDto updateSlot(UUID id, CreateSlotRequest request) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (request.getStartTime() != null) {
            slot.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            slot.setEndTime(request.getEndTime());
        }
        slot = slotRepository.save(slot);
        return SlotDto.fromEntity(slot);
    }

    @Transactional
    public void deleteSlot(UUID id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (mentorScheduleRepository.existsBySlotId(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete slot because it is assigned to one or more mentor schedules");
        }
        slotRepository.delete(slot);
    }
}
