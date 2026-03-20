package ar.com.inaudi.CentroVecinal.modules.socios.repository;

import ar.com.inaudi.CentroVecinal.modules.socios.model.CuotaSocio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuotaSocioRepository extends JpaRepository<CuotaSocio, Long> {

    boolean existsBySocioIdAndPeriodo(Long socioId, String periodo);

    boolean existsBySocioIdAndPeriodoAndIdNot(Long socioId, String periodo, Long id);

    Page<CuotaSocio> findBySocioIdOrderByPeriodoDesc(Long socioId, Pageable pageable);

    List<CuotaSocio> findBySocioIdOrderByPeriodoDesc(Long socioId);

    Optional<CuotaSocio> findByIdAndSocioId(Long id, Long socioId);
}
