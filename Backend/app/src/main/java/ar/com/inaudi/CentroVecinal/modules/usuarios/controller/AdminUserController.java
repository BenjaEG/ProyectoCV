package ar.com.inaudi.CentroVecinal.modules.usuarios.controller;

import ar.com.inaudi.CentroVecinal.modules.usuarios.dto.admin.*;
import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.modules.usuarios.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public PageResponseDTO<AdminUserListItemResponse> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String role,
            Pageable pageable
    ) {
        Page<AdminUserListItemResponse> page = adminUserService.listUsers(search, enabled, role, pageable);

        return PageResponseDTO.<AdminUserListItemResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @GetMapping("/roles")
    public List<KeycloakRoleResponse> listAvailableRoles() {
        return adminUserService.listAvailableRoles();
    }

    @GetMapping("/{userId}")
    public AdminUserDetailResponse getUserById(@PathVariable String userId) {
        return adminUserService.getUserById(userId);
    }

    @PostMapping
    public AdminUserDetailResponse createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return adminUserService.createUser(request);
    }

    @PutMapping("/{userId}")
    public AdminUserDetailResponse updateUser(
            @PathVariable String userId,
            @Valid @RequestBody AdminUserUpdateRequest request
    ) {
        return adminUserService.updateUser(userId, request);
    }

    @PatchMapping("/{userId}/status")
    public AdminUserDetailResponse updateUserStatus(
            @PathVariable String userId,
            @Valid @RequestBody AdminUserStatusUpdateRequest request
    ) {
        return adminUserService.updateUserStatus(userId, request);
    }

    @PatchMapping("/{userId}/roles")
    public AdminUserDetailResponse updateUserRoles(
            @PathVariable String userId,
            @Valid @RequestBody AdminUserRolesUpdateRequest request
    ) {
        return adminUserService.updateUserRoles(userId, request);
    }

    @PatchMapping("/{userId}/password")
    public void resetPassword(
            @PathVariable String userId,
            @Valid @RequestBody AdminUserPasswordResetRequest request
    ) {
        adminUserService.resetPassword(userId, request);
    }
}
