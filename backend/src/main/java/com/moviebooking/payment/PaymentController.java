package com.moviebooking.payment;

import com.moviebooking.payment.PaymentService.CallbackRequest;
import com.moviebooking.payment.PaymentService.PaymentDTO;
import com.moviebooking.payment.PaymentService.PaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentDTO pay(@Valid @RequestBody PaymentRequest req, Authentication auth) {
        return service.pay(auth.getName(), req);
    }

    @GetMapping("/{id}")
    public PaymentDTO get(@PathVariable Long id, Authentication auth) { return service.get(id, auth.getName()); }

    @PostMapping("/callback")
    public PaymentDTO callback(@Valid @RequestBody CallbackRequest req,
                               @RequestHeader(value = "X-Signature", required = false) String signature) {
        return service.handleCallback(req, signature);
    }
}
