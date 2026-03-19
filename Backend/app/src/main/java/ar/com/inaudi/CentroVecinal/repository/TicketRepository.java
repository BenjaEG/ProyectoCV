package ar.com.inaudi.CentroVecinal.repository;

import ar.com.inaudi.CentroVecinal.model.Ticket;
import ar.com.inaudi.CentroVecinal.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByCreatedByUserId(String createdByUserId);

    List<Ticket> findByAssignedOperatorId(String assignedOperatorId);
    
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Optional<Ticket> findTopByOrderByIdDesc();

    long countByStatus(TicketStatus status);

    long countByCreatedByUserId(String createdByUserId);

    long countByCreatedByUserIdAndStatus(String createdByUserId, TicketStatus status);

}
