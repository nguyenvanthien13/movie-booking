package com.moviebooking.showtime;

import com.moviebooking.booking.BookingSeatRepository;
import com.moviebooking.common.AppException;
import com.moviebooking.movie.Movie;
import com.moviebooking.movie.MovieService;
import com.moviebooking.room.Room;
import com.moviebooking.room.RoomRepository;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowtimeService {
    private static final int CLEANING_MINUTES = 15;

    private final ShowtimeRepository repo;
    private final RoomRepository roomRepository;
    private final MovieService movieService;
    private final BookingSeatRepository bookingSeatRepository;

    public record ShowtimeDTO(Long id, Long movieId, String movieTitle, Long cinemaId, String cinemaName,
                              Long roomId, String roomName, String roomType,
                              LocalDateTime startTime, LocalDateTime endTime, BigDecimal price, long availableSeats) {}

    public record CreateShowtimeRequest(@NotNull Long movieId, @NotNull Long roomId,
                                        @NotNull LocalDateTime startTime, @NotNull @Positive BigDecimal price) {}

    private ShowtimeDTO toDTO(Showtime s) {
        Room r = s.getRoom();
        long taken = bookingSeatRepository.countByShowtimeIdAndActiveTrue(s.getId());
        return new ShowtimeDTO(s.getId(), s.getMovie().getId(), s.getMovie().getTitle(),
                r.getCinema().getId(), r.getCinema().getName(), r.getId(), r.getName(), r.getRoomType(),
                s.getStartTime(), s.getEndTime(), s.getPrice(), Math.max(0, r.getCapacity() - taken));
    }

    /** Chỉ trả suất chiếu chưa bắt đầu. Nếu truyền date thì lọc theo ngày đó. */
    @Transactional(readOnly = true)
    public List<ShowtimeDTO> search(Long movieId, Long cinemaId, LocalDate date) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from = now, to = now.plusDays(60);
        if (date != null) {
            from = date.atStartOfDay().isAfter(now) ? date.atStartOfDay() : now;
            to = date.plusDays(1).atStartOfDay();
        }
        List<Showtime> list = cinemaId == null ? repo.search(movieId, from, to) : repo.searchByCinema(movieId, cinemaId, from, to);
        return list.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public ShowtimeDTO get(Long id) { return toDTO(find(id)); }

    @Transactional(readOnly = true)
    public List<ShowtimeDTO> findAllForAdmin() { return repo.findAllDetailed().stream().map(this::toDTO).toList(); }

    public Showtime find(Long id) {
        return repo.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy suất chiếu #" + id));
    }

    @Transactional
    public ShowtimeDTO create(CreateShowtimeRequest req) {
        Movie movie = movieService.find(req.movieId());
        Room room = roomRepository.findById(req.roomId()).orElseThrow(() -> AppException.notFound("Không tìm thấy phòng chiếu"));
        LocalDateTime end = req.startTime().plusMinutes(movie.getDuration() + CLEANING_MINUTES);
        if (repo.existsOverlap(room.getId(), req.startTime(), end)) {
            throw AppException.conflict("Phòng chiếu đã có suất khác trong khoảng thời gian này");
        }
        Showtime saved = repo.save(Showtime.builder().movie(movie).room(room)
                .startTime(req.startTime()).endTime(end).price(req.price()).build());
        return toDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
        repo.flush();
    }
}
