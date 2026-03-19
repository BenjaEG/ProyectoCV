package ar.com.inaudi.CentroVecinal.service;

import java.time.LocalDateTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.dto.ticket.CreateTicketRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketAssignmentRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketDetailResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketListItemResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketStatusHistoryResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketStatusUpdateRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketSummaryResponse;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.exception.ForbiddenException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.mapper.TicketMapper;
import ar.com.inaudi.CentroVecinal.model.Ticket;
import ar.com.inaudi.CentroVecinal.model.TicketCategory;
import ar.com.inaudi.CentroVecinal.model.TicketStatusHistory;
import ar.com.inaudi.CentroVecinal.model.enums.TicketStatus;
import ar.com.inaudi.CentroVecinal.repository.TicketCategoryRepository;
import ar.com.inaudi.CentroVecinal.repository.TicketRepository;
import ar.com.inaudi.CentroVecinal.repository.TicketSpecifications;
import ar.com.inaudi.CentroVecinal.repository.TicketStatusHistoryRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCategoryRepository categoryRepository;
    private final TicketStatusHistoryRepository statusHistoryRepository;
    private final CommentService commentService;
    private final AttachmentService attachmentService;

    public TicketService(
            TicketRepository ticketRepository,
            TicketCategoryRepository categoryRepository,
            TicketStatusHistoryRepository statusHistoryRepository,
            CommentService commentService,
            AttachmentService attachmentService) {

        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.commentService = commentService;
        this.attachmentService = attachmentService;
    }

    @Transactional
    public TicketDetailResponse createTicket(CreateTicketRequest request, CurrentUser currentUser) {
        TicketCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria no encontrada"));

        Ticket ticket = new Ticket();
        LocalDateTime now = LocalDateTime.now();

        ticket.setTicketCode(nextTicketCode());
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setLocation(request.getLocation().trim());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedByUserId(currentUser.userId());
        ticket.setCreatedByUsername(currentUser.username());
        ticket.setCreatedByEmail(currentUser.email());
        ticket.setCategory(category);
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        Ticket savedTicket = ticketRepository.save(ticket);

        return TicketMapper.toDetail(savedTicket, List.of(), List.of());
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<TicketListItemResponse> getTickets(
            String query,
            TicketStatus status,
            Long categoryId,
            Boolean assigned,
            Boolean assignedToMe,
            Boolean mine,
            Pageable pageable,
            CurrentUser currentUser) {

        Specification<Ticket> specification = Specification.allOf(
                TicketSpecifications.titleDescriptionCodeOrUserContains(query),
                TicketSpecifications.hasStatus(status),
                TicketSpecifications.hasCategoryId(categoryId),
                TicketSpecifications.isAssigned(assigned),
                Boolean.TRUE.equals(assignedToMe)
                        ? TicketSpecifications.hasAssignedOperator(currentUser.userId())
                        : null,
                shouldRestrictToMine(mine, currentUser)
                        ? TicketSpecifications.createdBy(currentUser.userId())
                        : null
        );

        Page<Ticket> page = ticketRepository.findAll(specification, pageable);

        return PageResponseDTO.<TicketListItemResponse>builder()
                .content(page.getContent().stream().map(TicketMapper::toListItem).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public TicketDetailResponse getTicketDetail(Long ticketId, CurrentUser currentUser) {
        Ticket ticket = findAccessibleTicket(ticketId, currentUser);
        return TicketMapper.toDetail(
                ticket,
                commentService.getCommentEntitiesByTicket(ticketId),
                attachmentService.getAttachmentEntitiesByTicket(ticketId)
        );
    }

    @Transactional
    public TicketDetailResponse updateAssignment(Long ticketId, TicketAssignmentRequest request, CurrentUser currentUser) {
        Ticket ticket = findExistingTicket(ticketId);

        if (!currentUser.isOperator() && !currentUser.isAdmin()) {
            throw new ForbiddenException("No tienes permisos para asignar tickets");
        }

        if (request.getAssignedOperatorId() == null || request.getAssignedOperatorId().isBlank()) {
            ticket.setAssignedOperatorId(null);
            ticket.setAssignedOperatorUsername(null);
        } else if (currentUser.isAdmin()) {
            if (request.getAssignedOperatorUsername() == null || request.getAssignedOperatorUsername().isBlank()) {
                throw new BadRequestException("assignedOperatorUsername es obligatorio para asignar desde admin");
            }
            ticket.setAssignedOperatorId(request.getAssignedOperatorId().trim());
            ticket.setAssignedOperatorUsername(request.getAssignedOperatorUsername().trim());
        } else {
            if (!request.getAssignedOperatorId().trim().equals(currentUser.userId())) {
                throw new ForbiddenException("Un operador solo puede asignarse tickets a si mismo");
            }
            ticket.setAssignedOperatorId(currentUser.userId());
            ticket.setAssignedOperatorUsername(currentUser.username());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket savedTicket = ticketRepository.save(ticket);
        return TicketMapper.toDetail(
                savedTicket,
                commentService.getCommentEntitiesByTicket(ticketId),
                attachmentService.getAttachmentEntitiesByTicket(ticketId)
        );
    }

    @Transactional
    public TicketDetailResponse updateStatus(Long ticketId, TicketStatusUpdateRequest request, CurrentUser currentUser) {
        if (!currentUser.isOperator() && !currentUser.isAdmin()) {
            throw new ForbiddenException("No tienes permisos para cambiar el estado");
        }

        Ticket ticket = findExistingTicket(ticketId);
        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            throw new BadRequestException("El ticket ya se encuentra en ese estado");
        }

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(ticket);
        history.setOldStatus(currentStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(currentUser.username());
        history.setChangedAt(LocalDateTime.now());
        statusHistoryRepository.save(history);

        return TicketMapper.toDetail(
                ticket,
                commentService.getCommentEntitiesByTicket(ticketId),
                attachmentService.getAttachmentEntitiesByTicket(ticketId)
        );
    }

    @Transactional(readOnly = true)
    public List<TicketStatusHistoryResponse> getHistory(Long ticketId, CurrentUser currentUser) {
        findAccessibleTicket(ticketId, currentUser);

        return statusHistoryRepository.findByTicketIdOrderByChangedAtDesc(ticketId)
                .stream()
                .map(TicketMapper::toHistoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketSummaryResponse getSummary(CurrentUser currentUser) {
        boolean mineOnly = currentUser.isNeighbor();

        return TicketSummaryResponse.builder()
                .total(mineOnly ? ticketRepository.countByCreatedByUserId(currentUser.userId()) : ticketRepository.count())
                .open(countByStatus(currentUser, TicketStatus.OPEN))
                .inReview(countByStatus(currentUser, TicketStatus.IN_REVIEW))
                .inProgress(countByStatus(currentUser, TicketStatus.IN_PROGRESS))
                .resolved(countByStatus(currentUser, TicketStatus.RESOLVED))
                .closed(countByStatus(currentUser, TicketStatus.CLOSED))
                .build();
    }

    private long countByStatus(CurrentUser currentUser, TicketStatus status) {
        return currentUser.isNeighbor()
                ? ticketRepository.countByCreatedByUserIdAndStatus(currentUser.userId(), status)
                : ticketRepository.countByStatus(status);
    }

    private boolean shouldRestrictToMine(Boolean mine, CurrentUser currentUser) {
        return currentUser.isNeighbor() || Boolean.TRUE.equals(mine);
    }

    private Ticket findAccessibleTicket(Long ticketId, CurrentUser currentUser) {
        Ticket ticket = findExistingTicket(ticketId);

        if (currentUser.isNeighbor() && !ticket.getCreatedByUserId().equals(currentUser.userId())) {
            throw new ForbiddenException("No tienes permisos para acceder a este ticket");
        }

        return ticket;
    }

    private Ticket findExistingTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
    }

    private String nextTicketCode() {
        long nextValue = ticketRepository.findTopByOrderByIdDesc()
                .map(ticket -> ticket.getId() + 1)
                .orElse(1L);

        return "TKT-" + String.format("%06d", nextValue);
    }
}
