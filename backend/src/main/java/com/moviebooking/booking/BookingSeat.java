package com.moviebooking.booking;

import com.moviebooking.common.BaseEntity;
import com.moviebooking.seat.Seat;
import com.moviebooking.showtime.Showtime;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "booking_seats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingSeat extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seat_id")
    private Seat seat;
    /** Lưu lại để unique index (showtime_id, seat_id) WHERE active chặn đặt trùng ghế. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;
    @Column(nullable = false)
    private BigDecimal price;
    /** false khi booking bị hủy / hết hạn -> ghế được giải phóng. */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
