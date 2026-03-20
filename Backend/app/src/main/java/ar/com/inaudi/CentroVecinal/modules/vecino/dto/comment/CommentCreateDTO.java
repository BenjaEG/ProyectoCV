package ar.com.inaudi.CentroVecinal.modules.vecino.dto.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentCreateDTO {

    @NotBlank
    private String content;

}
