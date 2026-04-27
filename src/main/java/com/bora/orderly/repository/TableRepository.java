package com.bora.orderly.repository;

import com.bora.orderly.entity.RestaurantTable;
import com.bora.orderly.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByStatus(TableStatus status);
    Optional<RestaurantTable> findByTableNumber(String tableNumber);
}
