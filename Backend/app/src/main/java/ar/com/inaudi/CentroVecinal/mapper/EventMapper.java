package ar.com.inaudi.CentroVecinal.mapper;

import ar.com.inaudi.CentroVecinal.dto.event.EventResponse;
import ar.com.inaudi.CentroVecinal.model.Event;

public final class EventMapper {

    private EventMapper() {
    }

    public static EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .copete(event.getCopete())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .eventTime(event.getEventTime())
                .location(event.getLocation())
                .imageUrl(event.getImageUrl())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .createdByUserId(event.getCreatedByUserId())
                .createdByUsername(event.getCreatedByUsername())
                .build();
    }
}
