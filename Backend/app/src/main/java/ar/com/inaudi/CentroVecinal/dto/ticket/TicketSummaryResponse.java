package ar.com.inaudi.CentroVecinal.dto.ticket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketSummaryResponse {

    private long total;
    private long open;
    private long inReview;
    private long inProgress;
    private long resolved;
    private long closed;
}
