package com.moviebooking.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingDTO(
        Long id, String bookingCode, BookingStatus status, BigDecimal totalAmount,
        LocalDateTime createdAt, LocalDateTime expiresAt,
        Long showtimeId, String movieTitle, String posterUrl, String cinemaName, String roomName, LocalDateTime startTime,
        List<String> seats, String customerName, String customerEmail, String paymentStatus) {}
