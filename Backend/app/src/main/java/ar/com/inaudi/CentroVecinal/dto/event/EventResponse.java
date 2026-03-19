package ar.com.inaudi.CentroVecinal.dto.event;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EventResponse {

    private Long id;
    private String title;
    private String copete;
    private String description;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String location;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByUserId;
    private String createdByUsername;
}
