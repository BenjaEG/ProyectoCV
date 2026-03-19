package ar.com.inaudi.CentroVecinal.dto.ticket;

import ar.com.inaudi.CentroVecinal.model.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {

    @NotNull
    private TicketStatus status;
}
