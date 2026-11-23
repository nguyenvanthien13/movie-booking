package com.moviebooking.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("select bs from BookingSeat bs join fetch bs.booking join fetch bs.seat " +
           "where bs.showtime.id = :showtimeId and bs.active = true")
    List<BookingSeat> findActiveByShowtime(@Param("showtimeId") Long showtimeId);

    @Query("select bs.seat.id from BookingSeat bs " +
           "where bs.showtime.id = :showtimeId and bs.seat.id in :seatIds and bs.active = true")
    List<Long> findActiveSeatIds(@Param("showtimeId") Long showtimeId, @Param("seatIds") Collection<Long> seatIds);

    long countByShowtimeIdAndActiveTrue(Long showtimeId);

    @Query("select count(bs) from BookingSeat bs where bs.booking.status = com.moviebooking.booking.BookingStatus.CONFIRMED")
    long countConfirmedTickets();
}
