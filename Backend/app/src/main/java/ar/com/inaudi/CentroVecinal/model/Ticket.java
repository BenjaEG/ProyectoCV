package ar.com.inaudi.CentroVecinal.model;

import java.time.LocalDateTime;

import ar.com.inaudi.CentroVecinal.model.enums.TicketPriority;
import ar.com.inaudi.CentroVecinal.model.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String ticketCode;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String location;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    // Usuario que creó el ticket
    private String createdByUserId;

    private String createdByUsername;

    private String createdByEmail;

    // Operador asignado
    private String assignedOperatorId;

    private String assignedOperatorUsername;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    private TicketCategory category;

}
