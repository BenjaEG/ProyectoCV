package ar.com.inaudi.CentroVecinal.modules.vecino.service;

import java.time.LocalDateTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.vecino.dto.comment.CommentCreateDTO;
import ar.com.inaudi.CentroVecinal.modules.vecino.dto.comment.CommentResponse;
import ar.com.inaudi.CentroVecinal.exception.ForbiddenException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.modules.vecino.mapper.TicketMapper;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.Comment;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.Ticket;
import ar.com.inaudi.CentroVecinal.modules.vecino.repository.CommentRepository;
import ar.com.inaudi.CentroVecinal.modules.vecino.repository.TicketRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public CommentService(CommentRepository commentRepository,
                          TicketRepository ticketRepository) {

        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public CommentResponse addComment(Long ticketId, CommentCreateDTO request, CurrentUser currentUser) {
        Ticket ticket = getAccessibleTicket(ticketId, currentUser);

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setContent(request.getContent().trim());
        comment.setAuthorId(currentUser.userId());
        comment.setAuthorUsername(currentUser.username());
        comment.setCreatedAt(LocalDateTime.now());

        return TicketMapper.toCommentResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTicket(Long ticketId, CurrentUser currentUser) {
        getAccessibleTicket(ticketId, currentUser);

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(TicketMapper::toCommentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentEntitiesByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    private Ticket getAccessibleTicket(Long ticketId, CurrentUser currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        if (currentUser.isNeighbor() && !ticket.getCreatedByUserId().equals(currentUser.userId())) {
            throw new ForbiddenException("No tienes permisos para acceder a este ticket");
        }

        return ticket;
    }
}
