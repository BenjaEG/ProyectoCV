package ar.com.inaudi.CentroVecinal.modules.vecino.dto.ticket;

import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {

    @NotNull
    private TicketStatus status;
}
