package com.moviebooking.booking;

import com.moviebooking.common.AppException;
import com.moviebooking.payment.Payment;
import com.moviebooking.payment.PaymentRepository;
import com.moviebooking.payment.PaymentStatus;
import com.moviebooking.seat.Seat;
import com.moviebooking.seat.SeatRepository;
import com.moviebooking.seat.SeatService;
import com.moviebooking.showtime.Showtime;
import com.moviebooking.showtime.ShowtimeService;
import com.moviebooking.user.Role;
import com.moviebooking.user.User;
import com.moviebooking.user.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatRepository seatRepository;
    private final PaymentRepository paymentRepository;
    private final ShowtimeService showtimeService;
    private final UserService userService;

    @Value("${app.booking.hold-minutes}")
    private long holdMinutes;
    @Value("${app.booking.max-seats}")
    private int maxSeats;

    /**
     * Tạo booking và GIỮ ghế trong {holdMinutes} phút.
     * Chống đặt trùng ở 2 lớp: (1) kiểm tra trước trong transaction, (2) unique index trong DB
     * (showtime_id, seat_id) WHERE active — nếu 2 người cùng lúc thì một người sẽ bị DB từ chối.
     */
    @Transactional
    public BookingDTO create(String email, CreateBookingRequest req) {
        User user = userService.getByEmail(email);
        Showtime showtime = showtimeService.find(req.showtimeId());
        if (!showtime.getStartTime().isAfter(LocalDateTime.now())) throw AppException.badRequest("Suất chiếu đã bắt đầu");

        Set<Long> seatIds = new LinkedHashSet<>(req.seatIds());
        if (seatIds.size() > maxSeats) throw AppException.badRequest("Tối đa " + maxSeats + " ghế cho mỗi lần đặt");

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()
                || seats.stream().anyMatch(s -> !s.getRoom().getId().equals(showtime.getRoom().getId()))) {
            throw AppException.badRequest("Ghế không hợp lệ cho suất chiếu này");
        }

        expirePending(); // giải phóng các ghế giữ quá hạn trước khi kiểm tra

        if (!bookingSeatRepository.findActiveSeatIds(showtime.getId(), seatIds).isEmpty()) {
            throw AppException.conflict("Có ghế vừa được người khác chọn. Vui lòng chọn ghế khác.");
        }

        LocalDateTime now = LocalDateTime.now();
        Booking booking = Booking.builder().user(user).showtime(showtime).bookingCode(newCode())
                .status(BookingStatus.PENDING).createdAt(now).expiresAt(now.plusMinutes(holdMinutes))
                .totalAmount(BigDecimal.ZERO).build();

        BigDecimal total = BigDecimal.ZERO;
        for (Seat seat : seats) {
            BigDecimal price = SeatService.priceFor(showtime.getPrice(), seat.getSeatType());
            booking.getSeats().add(BookingSeat.builder().booking(booking).seat(seat).showtime(showtime).price(price).active(true).build());
            total = total.add(price);
        }
        booking.setTotalAmount(total);

        try {
            bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException e) {
            throw AppException.conflict("Có ghế vừa được người khác chọn. Vui lòng chọn ghế khác.");
        }
        return toDTO(booking);
    }

    @Transactional(readOnly = true)
    public BookingDTO get(Long id, String email) { return toDTO(findOwned(id, email)); }

    @Transactional(readOnly = true)
    public List<BookingDTO> myBookings(String email) {
        User u = userService.getByEmail(email);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(u.getId()).stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> allForAdmin(int page, int size) {
        return bookingRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, Math.min(size, 100)))
                .stream().map(this::toDTO).toList();
    }

    /** PENDING: hủy tự do. CONFIRMED: chỉ hủy được trước giờ chiếu ít nhất 2 tiếng (hoàn tiền). */
    @Transactional
    public BookingDTO cancel(Long id, String email) {
        Booking b = findOwned(id, email);
        if (b.getStatus() == BookingStatus.CONFIRMED) {
            if (LocalDateTime.now().plusHours(2).isAfter(b.getShowtime().getStartTime())) {
                throw AppException.badRequest("Chỉ được hủy vé trước giờ chiếu ít nhất 2 tiếng");
            }
            paymentRepository.findByBookingId(b.getId()).ifPresent(p -> p.setStatus(PaymentStatus.REFUNDED));
        } else if (b.getStatus() != BookingStatus.PENDING) {
            throw AppException.badRequest("Booking này không thể hủy");
        }
        release(b, BookingStatus.CANCELLED);
        return toDTO(b);
    }

    @Transactional(readOnly = true)
    public TicketDTO ticket(Long id, String email) {
        Booking b = findOwned(id, email);
        if (b.getStatus() != BookingStatus.CONFIRMED) throw AppException.badRequest("Vé chỉ khả dụng sau khi thanh toán thành công");
        var room = b.getShowtime().getRoom();
        return new TicketDTO(b.getBookingCode(), b.getShowtime().getMovie().getTitle(),
                room.getCinema().getName(), room.getCinema().getAddress(), room.getName(),
                b.getShowtime().getStartTime(), seatNumbers(b), b.getTotalAmount(), b.getUser().getFullName(),
                "MBK:" + b.getBookingCode() + ":" + b.getId());
    }

    /** Dọn các booking PENDING đã quá hạn giữ ghế (gọi bởi scheduler và trước mỗi lần tạo booking). */
    @Transactional
    public int expirePending() {
        List<Booking> expired = bookingRepository.findByStatusAndExpiresAtBefore(BookingStatus.PENDING, LocalDateTime.now());
        expired.forEach(b -> release(b, BookingStatus.EXPIRED));
        if (!expired.isEmpty()) log.info("Released {} expired booking(s)", expired.size());
        return expired.size();
    }

    private void release(Booking b, BookingStatus status) {
        b.setStatus(status);
        b.setExpiresAt(null);
        b.getSeats().forEach(s -> s.setActive(false));
    }

    private Booking findOwned(Long id, String email) {
        Booking b = bookingRepository.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy booking #" + id));
        User u = userService.getByEmail(email);
        if (!b.getUser().getId().equals(u.getId()) && u.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Bạn không có quyền xem booking này");
        }
        return b;
    }

    private List<String> seatNumbers(Booking b) {
        return b.getSeats().stream().map(s -> s.getSeat().getSeatNumber()).sorted().toList();
    }

    public BookingDTO toDTO(Booking b) {
        Showtime st = b.getShowtime();
        String payStatus = paymentRepository.findByBookingId(b.getId()).map(Payment::getStatus).map(Enum::name).orElse(null);
        return new BookingDTO(b.getId(), b.getBookingCode(), b.getStatus(), b.getTotalAmount(), b.getCreatedAt(), b.getExpiresAt(),
                st.getId(), st.getMovie().getTitle(), st.getMovie().getPosterUrl(),
                st.getRoom().getCinema().getName(), st.getRoom().getName(), st.getStartTime(),
                seatNumbers(b), b.getUser().getFullName(), b.getUser().getEmail(), payStatus);
    }

    private String newCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("MB");
            for (int i = 0; i < 8; i++) sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            code = sb.toString();
        } while (bookingRepository.existsByBookingCode(code));
        return code;
    }
}
