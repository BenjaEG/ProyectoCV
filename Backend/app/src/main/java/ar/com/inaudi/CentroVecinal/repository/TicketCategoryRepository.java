package ar.com.inaudi.CentroVecinal.repository;

import ar.com.inaudi.CentroVecinal.model.TicketCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {

    boolean existsByNameIgnoreCase(String name);

}
