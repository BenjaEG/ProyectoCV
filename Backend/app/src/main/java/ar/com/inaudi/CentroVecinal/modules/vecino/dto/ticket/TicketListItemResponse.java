package ar.com.inaudi.CentroVecinal.modules.vecino.dto.ticket;

import java.time.LocalDateTime;

import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketPriority;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketListItemResponse {

    private Long id;
    private String ticketCode;
    private String title;
    private String location;
    private TicketStatus status;
    private TicketPriority priority;
    private String createdByUsername;
    private String assignedOperatorUsername;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
