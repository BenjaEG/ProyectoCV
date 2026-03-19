package ar.com.inaudi.CentroVecinal.controller;

import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.attachment.AttachmentResponse;
import ar.com.inaudi.CentroVecinal.dto.comment.CommentCreateDTO;
import ar.com.inaudi.CentroVecinal.dto.comment.CommentResponse;
import ar.com.inaudi.CentroVecinal.dto.common.PageResponseDTO;
import ar.com.inaudi.CentroVecinal.dto.ticket.CreateTicketRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketAssignmentRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketDetailResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketListItemResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketStatusHistoryResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketStatusUpdateRequest;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketSummaryResponse;
import ar.com.inaudi.CentroVecinal.model.enums.TicketStatus;
import ar.com.inaudi.CentroVecinal.security.SecurityUtils;
import ar.com.inaudi.CentroVecinal.service.AttachmentService;
import ar.com.inaudi.CentroVecinal.service.CommentService;
import ar.com.inaudi.CentroVecinal.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;
    private final AttachmentService attachmentService;

    public TicketController(
            TicketService ticketService,
            CommentService commentService,
            AttachmentService attachmentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.attachmentService = attachmentService;
    }

    @PreAuthorize("hasAnyRole('VECINO','ADMIN')")
    @PostMapping
    public TicketDetailResponse createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.createTicket(request, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping
    public PageResponseDTO<TicketListItemResponse> getTickets(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean assigned,
            @RequestParam(required = false) Boolean assignedToMe,
            @RequestParam(required = false) Boolean mine,
            @PageableDefault(sort = "createdAt") Pageable pageable) {

        return ticketService.getTickets(
                q,
                status,
                categoryId,
                assigned,
                assignedToMe,
                mine,
                pageable,
                SecurityUtils.getCurrentUser()
        );
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping("/{ticketId}")
    public TicketDetailResponse getTicketDetail(@PathVariable Long ticketId) {
        return ticketService.getTicketDetail(ticketId, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    @PatchMapping("/{ticketId}/assignment")
    public TicketDetailResponse updateAssignment(
            @PathVariable Long ticketId,
            @RequestBody TicketAssignmentRequest request) {

        return ticketService.updateAssignment(ticketId, request, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    @PatchMapping("/{ticketId}/status")
    public TicketDetailResponse updateStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketStatusUpdateRequest request) {

        return ticketService.updateStatus(ticketId, request, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping("/{ticketId}/history")
    public List<TicketStatusHistoryResponse> getHistory(@PathVariable Long ticketId) {
        return ticketService.getHistory(ticketId, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping("/summary")
    public TicketSummaryResponse getSummary() {
        return ticketService.getSummary(SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @PostMapping("/{ticketId}/comments")
    public CommentResponse addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentCreateDTO request) {

        return commentService.addComment(ticketId, request, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping("/{ticketId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long ticketId) {
        return commentService.getCommentsByTicket(ticketId, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @PostMapping("/{ticketId}/attachments")
    public AttachmentResponse addAttachment(
            @PathVariable Long ticketId,
            @RequestParam("file") MultipartFile file) {

        return attachmentService.addAttachment(ticketId, file, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping("/{ticketId}/attachments")
    public List<AttachmentResponse> getAttachments(@PathVariable Long ticketId) {
        return attachmentService.getAttachmentsByTicket(ticketId, SecurityUtils.getCurrentUser());
    }

    @PreAuthorize("hasAnyRole('OPERADOR','ADMIN')")
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId, SecurityUtils.getCurrentUser());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('VECINO','OPERADOR','ADMIN')")
    @GetMapping("/attachments/{attachmentId}/file")
    public ResponseEntity<Resource> getAttachmentFile(@PathVariable Long attachmentId) {
        AttachmentService.AttachmentFileResult fileResult = attachmentService.getAttachmentFile(attachmentId, SecurityUtils.getCurrentUser());
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (fileResult.contentType() != null && !fileResult.contentType().isBlank()) {
            mediaType = MediaType.parseMediaType(fileResult.contentType());
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileResult.fileName() + "\"")
                .contentType(mediaType)
                .body(fileResult.resource());
    }
}
