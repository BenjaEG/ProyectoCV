package ar.com.inaudi.CentroVecinal.dto.ticket;

import lombok.Data;

@Data
public class TicketAssignmentRequest {

    private String assignedOperatorId;
    private String assignedOperatorUsername;
}
