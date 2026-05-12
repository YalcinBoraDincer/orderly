package com.bora.orderly.repository;

import com.bora.orderly.entity.Reservation;
import com.bora.orderly.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByReservationTimeBetweenOrderByReservationTimeAsc(LocalDateTime start, LocalDateTime end);
    List<Reservation> findByTableIdAndStatus(Long tableId, ReservationStatus status);
}
