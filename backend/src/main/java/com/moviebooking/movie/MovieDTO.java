package com.moviebooking.movie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record MovieDTO(
        Long id,
        @NotBlank(message = "Tên phim không được để trống") String title,
        String description,
        @NotNull @Positive(message = "Thời lượng phải lớn hơn 0") Integer duration,
        String genre,
        String posterUrl,
        String trailerUrl,
        LocalDate releaseDate,
        MovieStatus status) {}
