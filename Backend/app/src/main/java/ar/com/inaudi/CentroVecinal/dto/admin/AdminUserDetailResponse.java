package ar.com.inaudi.CentroVecinal.dto.admin;

import java.util.List;
import java.util.Map;

public record AdminUserDetailResponse(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        boolean emailVerified,
        Long createdTimestamp,
        List<String> roles,
        Map<String, java.util.List<String>> attributes
) {
}
