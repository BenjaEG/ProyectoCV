package ar.com.inaudi.CentroVecinal.modules.comprobantes.repository;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.Comprobante;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ComprobanteRepository extends JpaRepository<Comprobante, Long>, JpaSpecificationExecutor<Comprobante> {

    Optional<Comprobante> findTopByOrderBySecuenciaNumeroDesc();

    Optional<Comprobante> findByNumero(String numero);
}
