package ar.com.inaudi.CentroVecinal.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCategoryCreateRequest {

    @NotBlank(message = "El nombre no puede estar vacio")
    private String name;
}
