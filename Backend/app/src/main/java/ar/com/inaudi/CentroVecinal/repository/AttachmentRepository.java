package ar.com.inaudi.CentroVecinal.repository;

import ar.com.inaudi.CentroVecinal.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicketIdOrderByUploadedAtAsc(Long ticketId);

    long countByTicketId(Long ticketId);
}
