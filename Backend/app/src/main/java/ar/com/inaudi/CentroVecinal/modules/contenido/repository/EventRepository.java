package ar.com.inaudi.CentroVecinal.modules.contenido.repository;

import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.contenido.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByEventDateAscEventTimeAsc();
}
