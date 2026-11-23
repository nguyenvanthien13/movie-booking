package com.moviebooking.payment;

import com.moviebooking.booking.Booking;
import com.moviebooking.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", unique = true)
    private Booking booking;
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;
    @Column(name = "transaction_id")
    private String transactionId;
    @Column(nullable = false)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
