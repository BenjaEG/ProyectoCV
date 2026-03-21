package ar.com.inaudi.CentroVecinal.modules.institucional.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "configuracion_institucional")
public class ConfiguracionInstitucional {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombreCentroVecinal;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcionHome;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcionContacto;

    @Column(nullable = false)
    private Boolean mostrarTelefono;

    @Column(length = 80)
    private String telefono;

    @Column(nullable = false)
    private Boolean mostrarEmail;

    @Column(length = 160)
    private String email;

    @Column(nullable = false)
    private Boolean mostrarDireccion;

    @Column(columnDefinition = "TEXT")
    private String direccion;

    @Column(nullable = false)
    private Boolean mostrarHorarioAtencion;

    @Column(length = 160)
    private String horarioAtencion;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
