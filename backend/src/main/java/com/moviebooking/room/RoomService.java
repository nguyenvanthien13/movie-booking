package com.moviebooking.room;

import com.moviebooking.cinema.CinemaService;
import com.moviebooking.common.AppException;
import com.moviebooking.seat.SeatService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository repo;
    private final CinemaService cinemaService;
    private final SeatService seatService;

    public record RoomDTO(Long id, Long cinemaId, String name, String roomType, Integer capacity) {
        static RoomDTO from(Room r) { return new RoomDTO(r.getId(), r.getCinema().getId(), r.getName(), r.getRoomType(), r.getCapacity()); }
    }

    public record CreateRoomRequest(
            @NotNull Long cinemaId,
            @NotBlank(message = "Tên phòng không được để trống") String name,
            String roomType,
            @Min(1) @Max(26) int rows,
            @Min(1) @Max(30) int columns) {}

    @Transactional(readOnly = true)
    public List<RoomDTO> byCinema(Long cinemaId) {
        return repo.findByCinemaIdOrderByName(cinemaId).stream().map(RoomDTO::from).toList();
    }

    /** Tạo phòng và tự sinh sơ đồ ghế rows x columns. */
    @Transactional
    public RoomDTO create(CreateRoomRequest req) {
        Room room = repo.save(Room.builder()
                .cinema(cinemaService.find(req.cinemaId()))
                .name(req.name().trim())
                .roomType(req.roomType() == null || req.roomType().isBlank() ? "2D" : req.roomType())
                .capacity(req.rows() * req.columns()).build());
        seatService.generateForRoom(room, req.rows(), req.columns());
        return RoomDTO.from(room);
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(repo.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy phòng #" + id)));
        repo.flush();
    }
}
