package ar.com.inaudi.CentroVecinal.modules.usuarios.controller;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.modules.usuarios.dto.admin.AdminUserListItemResponse;
import ar.com.inaudi.CentroVecinal.modules.usuarios.service.AdminUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/lookup")
@PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
public class UserLookupController {

    private final AdminUserService adminUserService;

    public UserLookupController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public PageResponseDTO<AdminUserListItemResponse> lookupUsers(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<AdminUserListItemResponse> page = adminUserService.listUsers(search, true, null, pageable);

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
}
