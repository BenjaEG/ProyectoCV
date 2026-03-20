package ar.com.inaudi.CentroVecinal.modules.contenido.repository;

import java.util.List;
import java.util.Optional;

import ar.com.inaudi.CentroVecinal.modules.contenido.model.News;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {

    List<News> findAllByOrderByCreatedAtDesc();

    List<News> findByPublishedTrueOrderByCreatedAtDesc();

    Optional<News> findByIdAndPublishedTrue(Long id);
}
