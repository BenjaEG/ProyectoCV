package ar.com.inaudi.CentroVecinal.modules.socios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "socios")
public class Socio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String userId;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String apellido;

    @Column(nullable = false, unique = true, length = 32)
    private String dni;

    @Column(nullable = false, length = 255)
    private String domicilio;

    @Column(nullable = false)
    private LocalDate fechaAlta;

    private LocalDate fechaBaja;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TipoSocio tipoSocio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private EstadoSocio estadoSocio;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
