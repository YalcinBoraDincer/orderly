package com.bora.orderly.entity;

import com.bora.orderly.enums.TableStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_tables")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_number", unique = true, nullable = false, length = 10)
    private String tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status = TableStatus.AVAILABLE;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(length = 50)
    private String location; // INDOOR, OUTDOOR, VIP
}
