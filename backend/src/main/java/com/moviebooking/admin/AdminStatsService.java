package com.moviebooking.admin;

import com.moviebooking.booking.BookingSeatRepository;
import com.moviebooking.movie.MovieRepository;
import com.moviebooking.payment.Payment;
import com.moviebooking.payment.PaymentRepository;
import com.moviebooking.payment.PaymentStatus;
import com.moviebooking.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminStatsService {
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final PaymentRepository paymentRepository;

    public record DailyRevenue(LocalDate date, BigDecimal revenue) {}

    public record StatsDTO(long totalMovies, long totalTicketsSold, BigDecimal totalRevenue,
                           long totalUsers, List<DailyRevenue> revenueByDay) {}

    @Transactional(readOnly = true)
    public StatsDTO stats(int days) {
        LocalDate today = LocalDate.now();
        LocalDate first = today.minusDays(days - 1L);

        BigDecimal total = BigDecimal.ZERO;
        Map<LocalDate, BigDecimal> byDay = new TreeMap<>();
        for (int i = 0; i < days; i++) byDay.put(first.plusDays(i), BigDecimal.ZERO);

        // Doanh thu tổng = các giao dịch thành công (đã hoàn tiền không tính)
        for (Payment p : paymentRepository.findByStatusAndPaidAtAfter(PaymentStatus.SUCCESS, LocalDateTime.of(2000, 1, 1, 0, 0))) {
            total = total.add(p.getAmount());
            LocalDate d = p.getPaidAt().toLocalDate();
            if (byDay.containsKey(d)) byDay.merge(d, p.getAmount(), BigDecimal::add);
        }
        List<DailyRevenue> series = byDay.entrySet().stream().map(e -> new DailyRevenue(e.getKey(), e.getValue())).toList();
        return new StatsDTO(movieRepository.count(), bookingSeatRepository.countConfirmedTickets(), total, userRepository.count(), series);
    }
}
