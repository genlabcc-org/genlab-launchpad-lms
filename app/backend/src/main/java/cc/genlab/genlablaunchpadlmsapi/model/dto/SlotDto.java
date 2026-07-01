package cc.genlab.genlablaunchpadlmsapi.model.dto;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Slot;
import java.time.LocalTime;
import java.util.UUID;

public record SlotDto(
    UUID id,
    String name,
    LocalTime startTime,
    LocalTime endTime
) {
    public static SlotDto fromEntity(Slot slot) {
        if (slot == null) return null;
        String formattedName = formatTime(slot.getStartTime()) + " - " + formatTime(slot.getEndTime());
        return new SlotDto(
            slot.getId(),
            formattedName,
            slot.getStartTime(),
            slot.getEndTime()
        );
    }
    
    private static String formatTime(LocalTime time) {
        if (time == null) return "";
        int hour = time.getHour();
        String ampm = hour >= 12 ? "pm" : "am";
        int displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
        int min = time.getMinute();
        String minStr = min == 0 ? "" : ":" + String.format("%02d", min);
        return displayHour + minStr + " " + ampm;
    }
}
