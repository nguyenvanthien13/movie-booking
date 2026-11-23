package com.moviebooking.booking;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime time);
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsByBookingCode(String code);
}
