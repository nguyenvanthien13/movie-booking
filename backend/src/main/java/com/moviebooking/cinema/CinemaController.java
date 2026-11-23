package com.moviebooking.cinema;

import com.moviebooking.cinema.CinemaService.CinemaDTO;
import com.moviebooking.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CinemaController {
    private final CinemaService service;

    @GetMapping("/api/cinemas")
    public List<CinemaDTO> list() { return service.findAll(); }

    @GetMapping("/api/cinemas/{id}")
    public CinemaDTO get(@PathVariable Long id) { return service.get(id); }

    @PostMapping("/api/admin/cinemas")
    @ResponseStatus(HttpStatus.CREATED)
    public CinemaDTO create(@Valid @RequestBody CinemaDTO d) { return service.create(d); }

    @PutMapping("/api/admin/cinemas/{id}")
    public CinemaDTO update(@PathVariable Long id, @Valid @RequestBody CinemaDTO d) { return service.update(id, d); }

    @DeleteMapping("/api/admin/cinemas/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok("Đã xóa rạp");
    }
}
