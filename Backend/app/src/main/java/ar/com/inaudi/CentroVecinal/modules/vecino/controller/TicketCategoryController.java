package ar.com.inaudi.CentroVecinal.modules.vecino.controller;

import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.vecino.dto.ticket.TicketCategoryCreateRequest;
import ar.com.inaudi.CentroVecinal.modules.vecino.dto.ticket.TicketCategoryResponse;
import ar.com.inaudi.CentroVecinal.modules.vecino.service.TicketCategoryService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ticket-categories")
public class TicketCategoryController {

    private final TicketCategoryService categoryService;

    public TicketCategoryController(TicketCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping
    public List<TicketCategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public TicketCategoryResponse createCategory(@Valid @RequestBody TicketCategoryCreateRequest request) {
        return categoryService.createCategory(request);
    }
}
