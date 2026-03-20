package ar.com.inaudi.CentroVecinal.modules.socios.model;

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
        name = "cuotas_socio",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_cuota_socio_periodo", columnNames = {"socio_id", "periodo"})
        }
)
public class CuotaSocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "socio_id", nullable = false)
    private Socio socio;

    @Column(nullable = false, length = 7)
    private String periodo;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private EstadoPagoCuota estadoPago;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    private LocalDate fechaPago;

    @Column(length = 80)
    private String tipoComprobante;

    @Column(length = 80)
    private String numeroComprobante;

    @Column(length = 80)
    private String medioPago;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
