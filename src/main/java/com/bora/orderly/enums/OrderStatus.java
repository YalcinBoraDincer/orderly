package com.bora.orderly.enums;

public enum OrderStatus {
    PENDING,       // Sipariş alındı, mutfağa iletilmedi
    IN_PROGRESS,   // Mutfakta hazırlanıyor
    READY,         // Hazır, servise çıkacak
    DELIVERED,     // Masaya teslim edildi
    CLOSED,        // Hesap ödendi, kapandı
    CANCELLED      // İptal edildi
}
