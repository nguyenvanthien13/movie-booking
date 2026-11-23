package com.moviebooking.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TicketDTO(String bookingCode, String movieTitle, String cinemaName, String cinemaAddress,
                        String roomName, LocalDateTime startTime, List<String> seats,
                        BigDecimal totalAmount, String customerName, String qrPayload) {}
