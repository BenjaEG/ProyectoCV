package ar.com.inaudi.CentroVecinal.modules.socios.repository;

import ar.com.inaudi.CentroVecinal.modules.socios.model.EstadoSocio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import ar.com.inaudi.CentroVecinal.modules.socios.model.TipoSocio;
import org.springframework.data.jpa.domain.Specification;

public final class SocioSpecifications {

    private SocioSpecifications() {
    }

    public static Specification<Socio> search(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        String like = "%" + query.trim().toLowerCase() + "%";

        return (root, cq, cb) -> cb.or(
                cb.like(cb.lower(root.get("nombre")), like),
                cb.like(cb.lower(root.get("apellido")), like),
                cb.like(cb.lower(cb.concat(cb.concat(root.get("nombre"), " "), root.get("apellido"))), like),
                cb.like(cb.lower(root.get("dni")), like),
                cb.like(cb.lower(root.get("domicilio")), like)
        );
    }

    public static Specification<Socio> hasEstado(EstadoSocio estadoSocio) {
        if (estadoSocio == null) {
            return null;
        }

        return (root, cq, cb) -> cb.equal(root.get("estadoSocio"), estadoSocio);
    }

    public static Specification<Socio> hasTipo(TipoSocio tipoSocio) {
        if (tipoSocio == null) {
            return null;
        }

        return (root, cq, cb) -> cb.equal(root.get("tipoSocio"), tipoSocio);
    }

    public static Specification<Socio> hasUserLinked(Boolean vinculado) {
        if (vinculado == null) {
            return null;
        }

        return vinculado
                ? (root, cq, cb) -> cb.isNotNull(root.get("userId"))
                : (root, cq, cb) -> cb.isNull(root.get("userId"));
    }
}
