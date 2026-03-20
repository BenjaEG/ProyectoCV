package ar.com.inaudi.CentroVecinal.modules.vecino.dto.attachment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AttachmentCreateRequest {

    @NotBlank
    private String fileName;

    @NotBlank
    private String filePath;
}
