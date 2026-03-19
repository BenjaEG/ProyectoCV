package ar.com.inaudi.CentroVecinal.dto.ticket;

import ar.com.inaudi.CentroVecinal.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String location;

    @NotNull
    private TicketPriority priority;

    @NotNull
    private Long categoryId;
}
