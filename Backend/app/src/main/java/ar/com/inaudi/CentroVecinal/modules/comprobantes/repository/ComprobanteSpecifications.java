package ar.com.inaudi.CentroVecinal.modules.comprobantes.repository;

import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.Comprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.EstadoComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.OrigenComprobante;
import ar.com.inaudi.CentroVecinal.modules.comprobantes.model.TipoComprobante;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

public final class ComprobanteSpecifications {

    private ComprobanteSpecifications() {
    }

    public static Specification<Comprobante> qContains(String q) {
        if (q == null || q.isBlank()) {
            return null;
        }

        String like = "%" + q.trim().toLowerCase() + "%";

        return (root, query, cb) -> {
            Join<Comprobante, Socio> socioJoin = root.join("socio", jakarta.persistence.criteria.JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("numero")), like),
                    cb.like(cb.lower(root.get("concepto")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("nombrePagador"), "")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("dniPagador"), "")), like),
                    cb.like(cb.lower(cb.coalesce(socioJoin.get("nombre"), "")), like),
                    cb.like(cb.lower(cb.coalesce(socioJoin.get("apellido"), "")), like),
                    cb.like(cb.lower(cb.coalesce(socioJoin.get("dni"), "")), like)
            );
        };
    }

    public static Specification<Comprobante> hasEstado(EstadoComprobante estado) {
        return estado == null ? null : (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }

    public static Specification<Comprobante> hasTipo(TipoComprobante tipo) {
        return tipo == null ? null : (root, query, cb) -> cb.equal(root.get("tipoComprobante"), tipo);
    }

    public static Specification<Comprobante> hasOrigen(OrigenComprobante origen) {
        return origen == null ? null : (root, query, cb) -> cb.equal(root.get("origen"), origen);
    }

    public static Specification<Comprobante> hasSocioId(Long socioId) {
        return socioId == null ? null : (root, query, cb) -> cb.equal(root.get("socio").get("id"), socioId);
    }
}
