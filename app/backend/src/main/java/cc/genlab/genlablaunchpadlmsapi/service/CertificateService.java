package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.entity.*;
import cc.genlab.genlablaunchpadlmsapi.repository.CertificateGenerationTaskRepository;
import cc.genlab.genlablaunchpadlmsapi.repository.EnrollmentRepository;
import com.lowagie.text.pdf.AcroFields;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import cc.genlab.genlablaunchpadlmsapi.service.port.CertificateServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;

/**
 * Handles certificate generation queueing and PDF generation/upload.
 * Extracted from AdminService to satisfy the Single Responsibility Principle.
 */
@Service
@RequiredArgsConstructor
public class CertificateService implements CertificateServicePort {

    private final EnrollmentRepository enrollmentRepository;
    private final StorageService storageService;
    private final CertificateGenerationTaskRepository certificateGenerationTaskRepository;

    @Transactional
    public void queueCertificateGeneration(UUID enrollmentId) {
        CertificateGenerationTask task = CertificateGenerationTask.builder()
                .enrollmentId(enrollmentId)
                .status("pending")
                .build();
        certificateGenerationTaskRepository.save(task);
    }

    @Transactional
    public void generateAndUploadCertificate(UUID enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enrollment not found"));

        Student student = enrollment.getStudent();
        if (student == null) {
            throw new IllegalStateException("Student not associated with enrollment");
        }

        Course course = null;
        if (enrollment.getMentorSchedule() != null) {
            course = enrollment.getMentorSchedule().getCourse();
        }
        String courseTitle = course != null ? course.getTitle() : "Launchpad Program";

        byte[] pdfBytes;
        try (InputStream templateStream = new ClassPathResource("pdf/certificate-template.pdf").getInputStream();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            PdfReader reader = new PdfReader(templateStream);
            PdfStamper stamper = new PdfStamper(reader, baos);
            AcroFields form = stamper.getAcroFields();

            // Fill form fields
            form.setField("student_name", student.getName() != null ? student.getName() : "John Doe");
            form.setField("course_name", courseTitle);

            // Flatten the PDF form fields so they become a read-only part of the document
            stamper.setFormFlattening(true);

            stamper.close();
            reader.close();

            pdfBytes = baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF certificate from template: " + e.getMessage(), e);
        }

        // Upload to S3
        String sanitizedStudentName = student.getName().replaceAll("[^a-zA-Z0-9-]", "_");
        String s3Key = "certificates/" + enrollmentId.toString() + "/" + sanitizedStudentName + ".pdf";

        storageService.uploadBytes(s3Key, pdfBytes, "application/pdf");

        enrollment.setCertificateKey(s3Key);
        enrollment.setStatus("completed");
        enrollmentRepository.save(enrollment);
    }
}
