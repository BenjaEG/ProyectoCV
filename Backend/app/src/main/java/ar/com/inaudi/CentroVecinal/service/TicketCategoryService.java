package ar.com.inaudi.CentroVecinal.service;

import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.ticket.TicketCategoryCreateRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketCategoryResponse;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.mapper.TicketMapper;
import ar.com.inaudi.CentroVecinal.model.TicketCategory;
import ar.com.inaudi.CentroVecinal.repository.TicketCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketCategoryService {

    private final TicketCategoryRepository repository;

    public TicketCategoryService(TicketCategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TicketCategoryResponse> getAllCategories() {
        return repository.findAll()
                .stream()
                .map(TicketMapper::toCategoryResponse)
                .toList();
    }

    @Transactional
    public TicketCategoryResponse createCategory(TicketCategoryCreateRequest request) {
        String normalizedName = request.getName().trim();

        if (repository.existsByNameIgnoreCase(normalizedName)) {
            throw new BadRequestException("Ya existe una categoria con ese nombre");
        }

        TicketCategory category = new TicketCategory();
        category.setName(normalizedName);

        return TicketMapper.toCategoryResponse(repository.save(category));
    }
}
