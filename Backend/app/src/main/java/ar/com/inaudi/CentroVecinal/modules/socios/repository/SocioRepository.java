package ar.com.inaudi.CentroVecinal.modules.socios.repository;

import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SocioRepository extends JpaRepository<Socio, Long>, JpaSpecificationExecutor<Socio> {

    boolean existsByDni(String dni);

    boolean existsByDniAndIdNot(String dni, Long id);

    Optional<Socio> findByUserId(String userId);
}
