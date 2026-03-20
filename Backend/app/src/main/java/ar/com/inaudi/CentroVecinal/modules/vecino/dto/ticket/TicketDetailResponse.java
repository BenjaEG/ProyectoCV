package ar.com.inaudi.CentroVecinal.modules.vecino.dto.ticket;

import java.time.LocalDateTime;
import java.util.List;

import ar.com.inaudi.CentroVecinal.modules.vecino.dto.attachment.AttachmentResponse;
import ar.com.inaudi.CentroVecinal.modules.vecino.dto.comment.CommentResponse;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketPriority;
import ar.com.inaudi.CentroVecinal.modules.vecino.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketDetailResponse {

    private Long id;
    private String ticketCode;
    private String title;
    private String description;
    private String location;
    private TicketStatus status;
    private TicketPriority priority;
    private String createdByUserId;
    private String createdByUsername;
    private String createdByEmail;
    private String assignedOperatorId;
    private String assignedOperatorUsername;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
}
