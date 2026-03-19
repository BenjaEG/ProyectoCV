package ar.com.inaudi.CentroVecinal.mapper;

import java.util.List;

import ar.com.inaudi.CentroVecinal.dto.attachment.AttachmentResponse;
import ar.com.inaudi.CentroVecinal.dto.comment.CommentResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketCategoryResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketDetailResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketListItemResponse;
import ar.com.inaudi.CentroVecinal.dto.ticket.TicketStatusHistoryResponse;
import ar.com.inaudi.CentroVecinal.model.Attachment;
import ar.com.inaudi.CentroVecinal.model.Comment;
import ar.com.inaudi.CentroVecinal.model.Ticket;
import ar.com.inaudi.CentroVecinal.model.TicketCategory;
import ar.com.inaudi.CentroVecinal.model.TicketStatusHistory;

public final class TicketMapper {

    private TicketMapper() {
    }

    public static TicketListItemResponse toListItem(Ticket ticket) {
        if (ticket == null) {
            return null;
        }

        return TicketListItemResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .title(ticket.getTitle())
                .location(ticket.getLocation())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdByUsername(ticket.getCreatedByUsername())
                .assignedOperatorUsername(ticket.getAssignedOperatorUsername())
                .categoryId(ticket.getCategory() != null ? ticket.getCategory().getId() : null)
                .categoryName(ticket.getCategory() != null ? ticket.getCategory().getName() : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public static TicketDetailResponse toDetail(Ticket ticket, List<Comment> comments, List<Attachment> attachments) {
        if (ticket == null) {
            return null;
        }

        return TicketDetailResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .location(ticket.getLocation())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .createdByUserId(ticket.getCreatedByUserId())
                .createdByUsername(ticket.getCreatedByUsername())
                .createdByEmail(ticket.getCreatedByEmail())
                .assignedOperatorId(ticket.getAssignedOperatorId())
                .assignedOperatorUsername(ticket.getAssignedOperatorUsername())
                .categoryId(ticket.getCategory() != null ? ticket.getCategory().getId() : null)
                .categoryName(ticket.getCategory() != null ? ticket.getCategory().getName() : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .comments(comments == null ? List.of() : comments.stream().map(TicketMapper::toCommentResponse).toList())
                .attachments(attachments == null ? List.of() : attachments.stream().map(TicketMapper::toAttachmentResponse).toList())
                .build();
    }

    public static TicketCategoryResponse toCategoryResponse(TicketCategory category) {
        return TicketCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    public static CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthorId())
                .authorUsername(comment.getAuthorUsername())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static TicketStatusHistoryResponse toHistoryResponse(TicketStatusHistory history) {
        return TicketStatusHistoryResponse.builder()
                .id(history.getId())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .changedBy(history.getChangedBy())
                .changedAt(history.getChangedAt())
                .build();
    }

    public static AttachmentResponse toAttachmentResponse(Attachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .filePath("/api/tickets/attachments/" + attachment.getId() + "/file")
                .contentType(attachment.getContentType())
                .sizeBytes(attachment.getSizeBytes())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}
