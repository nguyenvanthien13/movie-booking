package com.moviebooking.booking;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;

    @PostMapping("/api/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDTO create(@Valid @RequestBody CreateBookingRequest req, Authentication auth) {
        return service.create(auth.getName(), req);
    }

    @GetMapping("/api/bookings/my-bookings")
    public List<BookingDTO> mine(Authentication auth) { return service.myBookings(auth.getName()); }

    @GetMapping("/api/bookings/{id}")
    public BookingDTO get(@PathVariable Long id, Authentication auth) { return service.get(id, auth.getName()); }

    @PostMapping("/api/bookings/{id}/cancel")
    public BookingDTO cancel(@PathVariable Long id, Authentication auth) { return service.cancel(id, auth.getName()); }

    @GetMapping("/api/bookings/{id}/ticket")
    public TicketDTO ticket(@PathVariable Long id, Authentication auth) { return service.ticket(id, auth.getName()); }

    @GetMapping("/api/admin/bookings")
    public List<BookingDTO> all(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return service.allForAdmin(page, size);
    }
}
