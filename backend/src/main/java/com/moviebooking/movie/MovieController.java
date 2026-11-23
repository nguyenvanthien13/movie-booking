package com.moviebooking.movie;

import com.moviebooking.common.ApiResponse;
import com.moviebooking.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MovieController {
    private final MovieService service;

    @GetMapping("/api/movies")
    public PageResponse<MovieDTO> list(@RequestParam(required = false) String q,
                                       @RequestParam(required = false) MovieStatus status,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "12") int size) {
        return service.search(q, status, page, size);
    }

    @GetMapping("/api/movies/now-showing")
    public List<MovieDTO> nowShowing() { return service.byStatus(MovieStatus.NOW_SHOWING); }

    @GetMapping("/api/movies/upcoming")
    public List<MovieDTO> upcoming() { return service.byStatus(MovieStatus.UPCOMING); }

    @GetMapping("/api/movies/{id}")
    public MovieDTO get(@PathVariable Long id) { return service.get(id); }

    @PostMapping("/api/admin/movies")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieDTO create(@Valid @RequestBody MovieDTO dto) { return service.create(dto); }

    @PutMapping("/api/admin/movies/{id}")
    public MovieDTO update(@PathVariable Long id, @Valid @RequestBody MovieDTO dto) { return service.update(id, dto); }

    @DeleteMapping("/api/admin/movies/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok("Đã xóa phim");
    }
}
