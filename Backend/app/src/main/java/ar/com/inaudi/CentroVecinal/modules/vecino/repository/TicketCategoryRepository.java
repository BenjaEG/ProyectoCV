package ar.com.inaudi.CentroVecinal.modules.vecino.repository;

import ar.com.inaudi.CentroVecinal.modules.vecino.model.TicketCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketCategoryRepository extends JpaRepository<TicketCategory, Long> {

    boolean existsByNameIgnoreCase(String name);

}
