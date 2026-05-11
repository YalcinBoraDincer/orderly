package com.bora.orderly.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PaymentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by_user_id", nullable = false)
    private User deletedBy; // İptal eden kişi

    @Column(name = "deleted_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal deletedAmount;

    @Column(name = "deleted_tip_amount", precision = 10, scale = 2)
    private BigDecimal deletedTipAmount;

    @Column(columnDefinition = "TEXT")
    private String reason; // İptal sebebi opsiyonel eklenebilir

    @CreationTimestamp
    @Column(name = "deleted_at", updatable = false)
    private LocalDateTime deletedAt;
}
