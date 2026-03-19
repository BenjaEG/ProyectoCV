package ar.com.inaudi.CentroVecinal.repository;

import ar.com.inaudi.CentroVecinal.model.TicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {

    List<TicketStatusHistory> findByTicketIdOrderByChangedAtDesc(Long ticketId);

}