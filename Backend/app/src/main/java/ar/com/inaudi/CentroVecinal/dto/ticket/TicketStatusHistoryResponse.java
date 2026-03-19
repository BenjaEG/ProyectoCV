package ar.com.inaudi.CentroVecinal.dto.ticket;

import java.time.LocalDateTime;

import ar.com.inaudi.CentroVecinal.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketStatusHistoryResponse {

    private Long id;
    private TicketStatus oldStatus;
    private TicketStatus newStatus;
    private String changedBy;
    private LocalDateTime changedAt;
}
