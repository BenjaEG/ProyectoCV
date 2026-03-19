package ar.com.inaudi.CentroVecinal.service;

import java.time.LocalDateTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.event.EventResponse;
import ar.com.inaudi.CentroVecinal.dto.event.EventUpsertRequest;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.mapper.EventMapper;
import ar.com.inaudi.CentroVecinal.model.Event;
import ar.com.inaudi.CentroVecinal.repository.EventRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getPublicEvents() {
        return eventRepository.findAllByOrderByEventDateAscEventTimeAsc()
                .stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getPublicEventDetail(Long eventId) {
        return EventMapper.toResponse(findExistingEvent(eventId));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAdminEvents() {
        return getPublicEvents();
    }

    @Transactional(readOnly = true)
    public EventResponse getAdminEventDetail(Long eventId) {
        return EventMapper.toResponse(findExistingEvent(eventId));
    }

    @Transactional
    public EventResponse createEvent(EventUpsertRequest request, CurrentUser currentUser) {
        LocalDateTime now = LocalDateTime.now();

        Event event = new Event();
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription().trim());
        event.setCopete(request.getCopete().trim());
        event.setEventDate(request.getEventDate());
        event.setEventTime(request.getEventTime());
        event.setLocation(request.getLocation().trim());
        event.setImageUrl(normalizeOptional(request.getImageUrl()));
        event.setCreatedAt(now);
        event.setUpdatedAt(now);
        event.setCreatedByUserId(currentUser.userId());
        event.setCreatedByUsername(currentUser.username());

        return EventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse updateEvent(Long eventId, EventUpsertRequest request) {
        Event event = findExistingEvent(eventId);

        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription().trim());
        event.setCopete(request.getCopete().trim());
        event.setEventDate(request.getEventDate());
        event.setEventTime(request.getEventTime());
        event.setLocation(request.getLocation().trim());
        event.setImageUrl(normalizeOptional(request.getImageUrl()));
        event.setUpdatedAt(LocalDateTime.now());

        return EventMapper.toResponse(eventRepository.save(event));
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        Event event = findExistingEvent(eventId);
        eventRepository.delete(event);
    }

    private Event findExistingEvent(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado"));
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
