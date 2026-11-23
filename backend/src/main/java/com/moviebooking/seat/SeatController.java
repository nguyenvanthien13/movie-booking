package com.moviebooking.seat;

import com.moviebooking.seat.SeatService.SeatDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SeatController {
    private final SeatService service;

    /** Danh sách ghế của phòng (dùng cho admin). Sơ đồ ghế theo suất chiếu nằm ở /api/showtimes/{id}/seats. */
    @GetMapping("/api/rooms/{roomId}/seats")
    public List<SeatDTO> byRoom(@PathVariable Long roomId) { return service.byRoom(roomId); }
}
