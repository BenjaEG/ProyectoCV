package ar.com.inaudi.CentroVecinal.modules.contenido.dto.news;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NewsResponse {

    private Long id;
    private String title;
    private String copete;
    private String content;
    private String imageUrl;
    private Boolean published;
    private String authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
