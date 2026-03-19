package ar.com.inaudi.CentroVecinal.controller;

import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.event.EventResponse;
import ar.com.inaudi.CentroVecinal.dto.event.EventUpsertRequest;
import ar.com.inaudi.CentroVecinal.security.SecurityUtils;
import ar.com.inaudi.CentroVecinal.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/api/public/events")
    public List<EventResponse> getPublicEvents() {
        return eventService.getPublicEvents();
    }

    @GetMapping("/api/public/events/{eventId}")
    public EventResponse getPublicEventDetail(@PathVariable Long eventId) {
        return eventService.getPublicEventDetail(eventId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/events")
    public List<EventResponse> getAdminEvents() {
        return eventService.getAdminEvents();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/events/{eventId}")
    public EventResponse getAdminEventDetail(@PathVariable Long eventId) {
        return eventService.getAdminEventDetail(eventId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/events")
    public EventResponse createEvent(@Valid @RequestBody EventUpsertRequest request) {
        return eventService.createEvent(request, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/events/{eventId}")
    public EventResponse updateEvent(@PathVariable Long eventId, @Valid @RequestBody EventUpsertRequest request) {
        return eventService.updateEvent(eventId, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }
}
