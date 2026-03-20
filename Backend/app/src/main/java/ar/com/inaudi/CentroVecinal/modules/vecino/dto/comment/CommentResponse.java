package ar.com.inaudi.CentroVecinal.modules.vecino.dto.comment;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentResponse {

    private Long id;
    private String content;
    private String authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
}
