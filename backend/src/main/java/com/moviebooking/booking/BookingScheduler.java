package com.moviebooking.booking;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingScheduler {
    private final BookingService bookingService;

    /** Mỗi 30 giây: giải phóng ghế của các booking chưa thanh toán đúng hạn. */
    @Scheduled(fixedDelay = 30_000)
    public void releaseExpiredHolds() {
        bookingService.expirePending();
    }
}
