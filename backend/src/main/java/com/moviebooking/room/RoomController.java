package com.moviebooking.room;

import com.moviebooking.common.ApiResponse;
import com.moviebooking.room.RoomService.CreateRoomRequest;
import com.moviebooking.room.RoomService.RoomDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoomController {
    private final RoomService service;

    @GetMapping("/api/cinemas/{cinemaId}/rooms")
    public List<RoomDTO> byCinema(@PathVariable Long cinemaId) { return service.byCinema(cinemaId); }

    @PostMapping("/api/admin/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomDTO create(@Valid @RequestBody CreateRoomRequest req) { return service.create(req); }

    @DeleteMapping("/api/admin/rooms/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok("Đã xóa phòng");
    }
}
