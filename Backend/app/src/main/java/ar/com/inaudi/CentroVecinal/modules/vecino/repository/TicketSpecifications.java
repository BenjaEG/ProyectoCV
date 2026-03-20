package ar.com.inaudi.CentroVecinal.modules.vecino.repository;

import ar.com.inaudi.CentroVecinal.modules.vecino.model.Ticket;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketStatus;
import org.springframework.data.jpa.domain.Specification;

public final class TicketSpecifications {

    private TicketSpecifications() {
    }

    public static Specification<Ticket> titleDescriptionCodeOrUserContains(String query) {
        return (root, ignoredQuery, criteriaBuilder) -> {
            if (query == null || query.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            String likeQuery = "%" + query.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeQuery),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likeQuery),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("ticketCode")), likeQuery),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("createdByUsername")), likeQuery)
            );
        };
    }

    public static Specification<Ticket> hasStatus(TicketStatus status) {
        return (root, ignoredQuery, criteriaBuilder) ->
                status == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Ticket> hasCategoryId(Long categoryId) {
        return (root, ignoredQuery, criteriaBuilder) ->
                categoryId == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Ticket> hasAssignedOperator(String operatorId) {
        return (root, ignoredQuery, criteriaBuilder) ->
                operatorId == null || operatorId.isBlank()
                        ? criteriaBuilder.conjunction()
                        : criteriaBuilder.equal(root.get("assignedOperatorId"), operatorId);
    }

    public static Specification<Ticket> isAssigned(Boolean assigned) {
        return (root, ignoredQuery, criteriaBuilder) -> {
            if (assigned == null) {
                return criteriaBuilder.conjunction();
            }
            return assigned
                    ? criteriaBuilder.isNotNull(root.get("assignedOperatorId"))
                    : criteriaBuilder.isNull(root.get("assignedOperatorId"));
        };
    }

    public static Specification<Ticket> createdBy(String userId) {
        return (root, ignoredQuery, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("createdByUserId"), userId);
    }
}
