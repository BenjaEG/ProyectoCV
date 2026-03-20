package ar.com.inaudi.CentroVecinal.modules.vecino.dto.ticket;

import lombok.Data;

@Data
public class TicketAssignmentRequest {

    private String assignedOperatorId;
    private String assignedOperatorUsername;
}
