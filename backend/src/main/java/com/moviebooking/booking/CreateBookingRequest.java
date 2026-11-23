package com.moviebooking.booking;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateBookingRequest(@NotNull Long showtimeId, @NotEmpty(message = "Vui lòng chọn ít nhất 1 ghế") List<Long> seatIds) {}
