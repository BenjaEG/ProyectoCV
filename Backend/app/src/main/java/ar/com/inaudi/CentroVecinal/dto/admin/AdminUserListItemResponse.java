package ar.com.inaudi.CentroVecinal.dto.admin;

import java.util.List;

public record AdminUserListItemResponse(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        boolean emailVerified,
        Long createdTimestamp,
        List<String> roles
) {
}
