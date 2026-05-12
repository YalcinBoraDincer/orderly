package com.bora.orderly.service.impl;

import com.bora.orderly.dto.request.ReservationRequest;
import com.bora.orderly.dto.response.ReservationResponse;
import com.bora.orderly.entity.Reservation;
import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.ReservationStatus;
import com.bora.orderly.enums.TableStatus;
import com.bora.orderly.repository.ReservationRepository;
import com.bora.orderly.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        RestaurantTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("Masa bulunamadı"));

        if (request.getNumberOfGuests() > table.getCapacity()) {
            throw new RuntimeException("Masa kapasitesi yetersiz! Bu masa en fazla " + table.getCapacity() + " kişiliktir.");
        }

        Reservation reservation = Reservation.builder()
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .reservationTime(request.getReservationTime())
                .numberOfGuests(request.getNumberOfGuests())
                .table(table)
                .status(request.getStatus() != null ? request.getStatus() : ReservationStatus.CONFIRMED)
                .specialNotes(request.getSpecialNotes())
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);

        // If the reservation is for today and confirmed, update table status ONLY if it's currently AVAILABLE
        if (reservation.getStatus() == ReservationStatus.CONFIRMED &&
            reservation.getReservationTime().toLocalDate().isEqual(LocalDate.now())) {
            if (table.getStatus() == TableStatus.AVAILABLE) {
                table.setStatus(TableStatus.RESERVED);
                tableRepository.save(table);
            }
        }

        return mapToResponse(savedReservation);
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReservationResponse> getReservationsByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        return reservationRepository.findByReservationTimeBetweenOrderByReservationTimeAsc(startOfDay, endOfDay)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse updateReservationStatus(Long id, ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervasyon bulunamadı"));

        reservation.setStatus(status);

        if (status == ReservationStatus.CANCELLED || status == ReservationStatus.COMPLETED) {
            // Check if the table has other active reservations today, if not, set to AVAILABLE
            // Simplification: just set to AVAILABLE if it was RESERVED
            if (reservation.getTable().getStatus() == TableStatus.RESERVED) {
                reservation.getTable().setStatus(TableStatus.AVAILABLE);
                tableRepository.save(reservation.getTable());
            }
        } else if (status == ReservationStatus.CONFIRMED &&
                   reservation.getReservationTime().toLocalDate().isEqual(LocalDate.now())) {
            if (reservation.getTable().getStatus() == TableStatus.AVAILABLE) {
                reservation.getTable().setStatus(TableStatus.RESERVED);
                tableRepository.save(reservation.getTable());
            }
        }

        return mapToResponse(reservationRepository.save(reservation));
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .customerName(reservation.getCustomerName())
                .customerPhone(reservation.getCustomerPhone())
                .reservationTime(reservation.getReservationTime())
                .numberOfGuests(reservation.getNumberOfGuests())
                .tableId(reservation.getTable().getId())
                .tableNumber(reservation.getTable().getTableNumber())
                .status(reservation.getStatus())
                .specialNotes(reservation.getSpecialNotes())
                .build();
    }
}
