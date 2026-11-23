package com.moviebooking.movie;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByTitleContainingIgnoreCase(String title);
    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Movie> findByTitleContainingIgnoreCaseAndStatus(String title, MovieStatus status, Pageable pageable);
    List<Movie> findByStatusOrderByReleaseDateDesc(MovieStatus status);
}
