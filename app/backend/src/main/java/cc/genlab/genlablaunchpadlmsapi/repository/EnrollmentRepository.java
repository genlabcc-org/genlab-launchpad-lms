package cc.genlab.genlablaunchpadlmsapi.repository;

import cc.genlab.genlablaunchpadlmsapi.model.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByStudentId(UUID studentId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.mentorSchedule ms " +
           "WHERE ms.slot.id = :slotId AND e.status = 'active' " +
           "AND ms.startDate <= :endDate AND ms.endDate >= :startDate")
    List<Enrollment> findOverlappingEnrollmentsInSlot(
        @Param("slotId") UUID slotId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.mentorSchedule ms " +
           "WHERE ms.mentor.id = :mentorId AND ms.slot.id = :slotId AND e.status = 'active' " +
           "AND ms.startDate <= :endDate AND ms.endDate >= :startDate")
    List<Enrollment> findOverlappingEnrollmentsForMentorInSlot(
        @Param("mentorId") UUID mentorId, 
        @Param("slotId") UUID slotId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.student s " +
           "WHERE e.mentorSchedule.id IN :scheduleIds AND e.status = 'active'")
    List<Enrollment> findActiveEnrollmentsForSchedules(@Param("scheduleIds") List<UUID> scheduleIds);

    List<Enrollment> findByStudentIdAndStatus(UUID studentId, String status);

    List<Enrollment> findByStudentIdAndStatusNot(UUID studentId, String status);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'pending'")
    List<Enrollment> findAllPendingEnrollmentsForStudent(@Param("studentId") UUID studentId);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = 'pending' AND (e.mentorSchedule IS NULL OR e.mentorSchedule.course.id = :courseId)")
    java.util.Optional<Enrollment> findPendingEnrollmentForStudentAndCourse(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId);

    @Query("SELECT e FROM Enrollment e JOIN e.mentorSchedule ms WHERE ms.course.id = :courseId AND e.status = 'active'")
    List<Enrollment> findActiveEnrollmentsByCourseId(@Param("courseId") UUID courseId);
}
