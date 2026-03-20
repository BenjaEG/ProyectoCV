package ar.com.inaudi.CentroVecinal.modules.contenido.dto.news;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NewsUpsertRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    @Size(max = 100)
    private String copete;

    private String imageUrl;

    @NotNull
    private Boolean published;
}
