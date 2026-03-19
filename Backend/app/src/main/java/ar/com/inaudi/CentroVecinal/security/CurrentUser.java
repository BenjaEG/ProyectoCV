package ar.com.inaudi.CentroVecinal.security;

import java.util.Set;

public record CurrentUser(
        String userId,
        String username,
        String email,
        Set<String> roles
) {

    public boolean hasRole(String role) {
        return roles.contains(role);
    }

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public boolean isOperator() {
        return hasRole("OPERADOR");
    }

    public boolean isNeighbor() {
        return hasRole("VECINO") && !isOperator() && !isAdmin();
    }
}
