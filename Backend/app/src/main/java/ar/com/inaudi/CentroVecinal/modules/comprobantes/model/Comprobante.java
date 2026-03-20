package ar.com.inaudi.CentroVecinal.modules.comprobantes.model;

import ar.com.inaudi.CentroVecinal.modules.socios.model.Socio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "comprobantes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_comprobante_numero", columnNames = "numero"),
                @UniqueConstraint(name = "uk_comprobante_secuencia", columnNames = "secuencia_numero")
        }
)
public class Comprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "secuencia_numero", nullable = false)
    private Long secuenciaNumero;

    @Column(nullable = false, length = 32)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TipoComprobante tipoComprobante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private EstadoComprobante estado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OrigenComprobante origen;

    @ManyToOne
    @JoinColumn(name = "socio_id")
    private Socio socio;

    @Column(nullable = false)
    private LocalDate fechaEmision;

    @Column(nullable = false, length = 160)
    private String concepto;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(length = 80)
    private String medioPago;

    @Column(length = 160)
    private String nombrePagador;

    @Column(length = 32)
    private String dniPagador;

    @Column(length = 120)
    private String referenciaOrigenId;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(nullable = false, length = 100)
    private String createdByUserId;

    @Column(nullable = false, length = 120)
    private String createdByUsername;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime anulledAt;
}
