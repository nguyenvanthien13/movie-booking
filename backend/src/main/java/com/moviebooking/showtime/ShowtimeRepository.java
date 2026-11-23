package com.moviebooking.showtime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    @Query("select s from Showtime s join fetch s.movie join fetch s.room r join fetch r.cinema " +
           "where s.movie.id = :movieId and s.startTime >= :from and s.startTime < :to order by s.startTime")
    List<Showtime> search(@Param("movieId") Long movieId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("select s from Showtime s join fetch s.movie join fetch s.room r join fetch r.cinema " +
           "where s.movie.id = :movieId and r.cinema.id = :cinemaId and s.startTime >= :from and s.startTime < :to order by s.startTime")
    List<Showtime> searchByCinema(@Param("movieId") Long movieId, @Param("cinemaId") Long cinemaId,
                                  @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("select s from Showtime s join fetch s.movie join fetch s.room r join fetch r.cinema order by s.startTime desc")
    List<Showtime> findAllDetailed();

    /** Có suất chiếu nào khác trong cùng phòng bị chồng giờ không? */
    @Query("select count(s) > 0 from Showtime s where s.room.id = :roomId and s.startTime < :end and s.endTime > :start")
    boolean existsOverlap(@Param("roomId") Long roomId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
