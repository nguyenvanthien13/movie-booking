package com.moviebooking.payment;

import com.moviebooking.booking.Booking;
import com.moviebooking.booking.BookingRepository;
import com.moviebooking.booking.BookingStatus;
import com.moviebooking.common.AppException;
import com.moviebooking.user.User;
import com.moviebooking.user.UserService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Cổng thanh toán MÔ PHỎNG. Muốn tích hợp VNPay/MoMo/Stripe thật: thay phần "gọi cổng" trong pay()
 * bằng việc tạo URL thanh toán, và để /api/payments/callback xác nhận kết quả (đã có xác thực chữ ký).
 */
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserService userService;

    @Value("${app.payment.callback-secret}")
    private String callbackSecret;

    public record PaymentRequest(@NotNull Long bookingId, @NotBlank String paymentMethod, boolean simulateFailure) {}

    public record CallbackRequest(@NotNull Long bookingId, @NotBlank String transactionId,
                                  @NotBlank String status, @NotNull BigDecimal amount) {}

    public record PaymentDTO(Long id, Long bookingId, String paymentMethod, String transactionId,
                             BigDecimal amount, PaymentStatus status, LocalDateTime paidAt) {
        static PaymentDTO from(Payment p) {
            return new PaymentDTO(p.getId(), p.getBooking().getId(), p.getPaymentMethod(), p.getTransactionId(),
                    p.getAmount(), p.getStatus(), p.getPaidAt());
        }
    }

    @Transactional
    public PaymentDTO pay(String email, PaymentRequest req) {
        User user = userService.getByEmail(email);
        Booking booking = bookingRepository.findById(req.bookingId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy booking"));
        if (!booking.getUser().getId().equals(user.getId())) throw AppException.forbidden("Booking không thuộc về bạn");
        if (booking.getStatus() == BookingStatus.CONFIRMED) throw AppException.conflict("Booking đã được thanh toán");
        if (booking.getStatus() != BookingStatus.PENDING
                || (booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(LocalDateTime.now()))) {
            throw AppException.conflict("Đã hết thời gian giữ ghế. Vui lòng đặt lại.");
        }

        Payment p = paymentRepository.findByBookingId(booking.getId())
                .orElseGet(() -> Payment.builder().booking(booking).build());
        p.setPaymentMethod(req.paymentMethod());
        p.setAmount(booking.getTotalAmount());
        p.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());

        // --- mô phỏng phản hồi của cổng thanh toán ---
        if (req.simulateFailure()) {
            p.setStatus(PaymentStatus.FAILED);   // booking vẫn PENDING: người dùng có thể thử lại đến khi hết hạn giữ ghế
        } else {
            markSuccess(p, booking);
        }
        return PaymentDTO.from(paymentRepository.save(p));
    }

    @Transactional(readOnly = true)
    public PaymentDTO get(Long id, String email) {
        Payment p = paymentRepository.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy giao dịch"));
        User u = userService.getByEmail(email);
        if (!p.getBooking().getUser().getId().equals(u.getId()) && u.getRole() != com.moviebooking.user.Role.ADMIN) {
            throw AppException.forbidden("Bạn không có quyền xem giao dịch này");
        }
        return PaymentDTO.from(p);
    }

    /** Webhook từ cổng thanh toán. Chữ ký: HMAC-SHA256(secret, "bookingId|transactionId|status|amount") dạng hex. */
    @Transactional
    public PaymentDTO handleCallback(CallbackRequest req, String signature) {
        String data = req.bookingId() + "|" + req.transactionId() + "|" + req.status() + "|" + req.amount().toPlainString();
        if (signature == null || !MessageDigest.isEqual(sign(data).getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8))) {
            throw AppException.forbidden("Chữ ký không hợp lệ");
        }
        Payment p = paymentRepository.findByBookingId(req.bookingId())
                .orElseThrow(() -> AppException.notFound("Không tìm thấy giao dịch"));
        if (p.getStatus() == PaymentStatus.SUCCESS) return PaymentDTO.from(p); // idempotent: callback gửi lặp
        if (req.amount().compareTo(p.getAmount()) != 0) throw AppException.badRequest("Số tiền không khớp");

        if ("SUCCESS".equalsIgnoreCase(req.status())) {
            if (p.getBooking().getStatus() != BookingStatus.PENDING) throw AppException.conflict("Booking không còn ở trạng thái chờ thanh toán");
            markSuccess(p, p.getBooking());
        } else {
            p.setStatus(PaymentStatus.FAILED);
        }
        return PaymentDTO.from(p);
    }

    private void markSuccess(Payment p, Booking booking) {
        p.setStatus(PaymentStatus.SUCCESS);
        p.setPaidAt(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setExpiresAt(null); // ghế được xác nhận vĩnh viễn
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(callbackSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
