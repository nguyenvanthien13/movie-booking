package com.moviebooking.seat;

import com.moviebooking.booking.BookingSeat;
import com.moviebooking.booking.BookingSeatRepository;
import com.moviebooking.booking.BookingStatus;
import com.moviebooking.common.AppException;
import com.moviebooking.room.Room;
import com.moviebooking.showtime.Showtime;
import com.moviebooking.showtime.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ShowtimeRepository showtimeRepository;

    public enum SeatStatus { AVAILABLE, HELD, BOOKED }

    public record SeatDTO(Long id, String seatNumber, String rowName, Integer columnNumber, SeatType seatType) {}

    public record SeatStatusDTO(Long id, String seatNumber, String rowName, Integer columnNumber,
                                SeatType seatType, BigDecimal price, SeatStatus status) {}

    /** Hàng đầu STANDARD, nửa sau của phòng là VIP. */
    @Transactional
    public void generateForRoom(Room room, int rows, int columns) {
        List<Seat> seats = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            String rowName = String.valueOf((char) ('A' + r));
            SeatType type = r >= rows / 2 && rows > 2 ? SeatType.VIP : SeatType.STANDARD;
            for (int c = 1; c <= columns; c++) {
                seats.add(Seat.builder().room(room).rowName(rowName).columnNumber(c)
                        .seatNumber(rowName + c).seatType(type).build());
            }
        }
        seatRepository.saveAll(seats);
    }

    @Transactional(readOnly = true)
    public List<SeatDTO> byRoom(Long roomId) {
        return seatRepository.findByRoomIdOrderByRowNameAscColumnNumberAsc(roomId).stream()
                .map(s -> new SeatDTO(s.getId(), s.getSeatNumber(), s.getRowName(), s.getColumnNumber(), s.getSeatType()))
                .toList();
    }

    /** Sơ đồ ghế của suất chiếu: AVAILABLE / HELD (đang giữ, chờ thanh toán) / BOOKED (đã thanh toán). */
    @Transactional(readOnly = true)
    public List<SeatStatusDTO> seatMap(Long showtimeId) {
        Showtime st = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy suất chiếu #" + showtimeId));
        Map<Long, SeatStatus> taken = new HashMap<>();
        for (BookingSeat bs : bookingSeatRepository.findActiveByShowtime(showtimeId)) {
            taken.put(bs.getSeat().getId(),
                    bs.getBooking().getStatus() == BookingStatus.CONFIRMED ? SeatStatus.BOOKED : SeatStatus.HELD);
        }
        return seatRepository.findByRoomIdOrderByRowNameAscColumnNumberAsc(st.getRoom().getId()).stream()
                .map(s -> new SeatStatusDTO(s.getId(), s.getSeatNumber(), s.getRowName(), s.getColumnNumber(), s.getSeatType(),
                        priceFor(st.getPrice(), s.getSeatType()), taken.getOrDefault(s.getId(), SeatStatus.AVAILABLE)))
                .toList();
    }

    public static BigDecimal priceFor(BigDecimal base, SeatType type) {
        return base.multiply(type.getPriceMultiplier()).setScale(0, RoundingMode.HALF_UP);
    }
}
