package ar.com.inaudi.CentroVecinal.dto.event;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EventUpsertRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    @Size(max = 100)
    private String copete;

    @NotNull
    private LocalDate eventDate;

    @NotNull
    private LocalTime eventTime;

    @NotBlank
    private String location;

    private String imageUrl;
}
