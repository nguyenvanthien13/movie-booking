package com.moviebooking.auth;

import com.moviebooking.user.UserDTO;
import com.moviebooking.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    public record RefreshRequest(@NotBlank String refreshToken) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthService.AuthResponse register(@Valid @RequestBody RegisterRequest req) { return authService.register(req); }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@Valid @RequestBody LoginRequest req) { return authService.login(req); }

    @PostMapping("/refresh")
    public AuthService.AuthResponse refresh(@Valid @RequestBody RefreshRequest req) { return authService.refresh(req.refreshToken()); }

    @GetMapping("/me")
    public UserDTO me(Authentication auth) { return UserDTO.from(userService.getByEmail(auth.getName())); }
}
