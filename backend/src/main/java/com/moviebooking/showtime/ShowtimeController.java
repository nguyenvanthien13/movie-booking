package com.moviebooking.showtime;

import com.moviebooking.common.ApiResponse;
import com.moviebooking.seat.SeatService;
import com.moviebooking.seat.SeatService.SeatStatusDTO;
import com.moviebooking.showtime.ShowtimeService.CreateShowtimeRequest;
import com.moviebooking.showtime.ShowtimeService.ShowtimeDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ShowtimeController {
    private final ShowtimeService service;
    private final SeatService seatService;

    @GetMapping("/api/showtimes")
    public List<ShowtimeDTO> search(@RequestParam Long movieId,
                                    @RequestParam(required = false) Long cinemaId,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.search(movieId, cinemaId, date);
    }

    @GetMapping("/api/showtimes/{id}")
    public ShowtimeDTO get(@PathVariable Long id) { return service.get(id); }

    @GetMapping("/api/showtimes/{id}/seats")
    public List<SeatStatusDTO> seats(@PathVariable Long id) { return seatService.seatMap(id); }

    @GetMapping("/api/admin/showtimes")
    public List<ShowtimeDTO> all() { return service.findAllForAdmin(); }

    @PostMapping("/api/admin/showtimes")
    @ResponseStatus(HttpStatus.CREATED)
    public ShowtimeDTO create(@Valid @RequestBody CreateShowtimeRequest req) { return service.create(req); }

    @DeleteMapping("/api/admin/showtimes/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok("Đã xóa suất chiếu");
    }
}
