package ar.com.inaudi.CentroVecinal.dto.ticket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketCategoryResponse {

    private Long id;
    private String name;
}
