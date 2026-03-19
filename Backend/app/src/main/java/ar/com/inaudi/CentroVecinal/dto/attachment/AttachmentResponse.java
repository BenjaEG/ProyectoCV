package ar.com.inaudi.CentroVecinal.dto.attachment;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttachmentResponse {

    private Long id;
    private String fileName;
    private String filePath;
    private String contentType;
    private Long sizeBytes;
    private LocalDateTime uploadedAt;
}
