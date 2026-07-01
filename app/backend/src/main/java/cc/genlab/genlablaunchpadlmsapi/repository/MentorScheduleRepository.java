package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.MentorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MentorScheduleRepository extends JpaRepository<MentorSchedule, UUID> {

    @Query("SELECT ms FROM MentorSchedule ms WHERE ms.mentor.id = :mentorId " +
           "AND ms.slot.id = :slotId AND ms.startDate <= :endDate AND ms.endDate >= :startDate")
    List<MentorSchedule> findOverlappingSchedules(
        @Param("mentorId") UUID mentorId, 
        @Param("slotId") UUID slotId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT ms FROM MentorSchedule ms JOIN FETCH ms.slot JOIN FETCH ms.course " +
           "WHERE ms.mentor.id = :mentorId AND ms.startDate <= :endDate AND ms.endDate >= :startDate")
    List<MentorSchedule> findOverlappingSchedulesForMentor(
        @Param("mentorId") UUID mentorId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    boolean existsBySlotId(UUID slotId);
}
