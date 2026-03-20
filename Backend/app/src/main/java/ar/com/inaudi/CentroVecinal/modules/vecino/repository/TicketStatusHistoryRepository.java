package ar.com.inaudi.CentroVecinal.modules.vecino.repository;

import ar.com.inaudi.CentroVecinal.modules.vecino.model.TicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Long> {

    List<TicketStatusHistory> findByTicketIdOrderByChangedAtDesc(Long ticketId);

}