package com.moviebooking.auth;

import com.moviebooking.common.AppException;
import com.moviebooking.user.*;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public record AuthResponse(String accessToken, String refreshToken, UserDTO user) {}

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) throw AppException.conflict("Email đã được sử dụng");
        User u = userRepository.save(User.builder()
                .fullName(req.fullName().trim()).email(email).phone(req.phone())
                .password(passwordEncoder.encode(req.password())).role(Role.USER).build());
        return tokens(u);
    }

    public AuthResponse login(LoginRequest req) {
        User u = userRepository.findByEmail(req.email().trim().toLowerCase())
                .filter(x -> passwordEncoder.matches(req.password(), x.getPassword()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        return tokens(u);
    }

    public AuthResponse refresh(String refreshToken) {
        try {
            Claims c = jwtService.parse(refreshToken);
            if (!"refresh".equals(c.get("type"))) throw new JwtException("not a refresh token");
            User u = userRepository.findByEmail(c.getSubject()).orElseThrow(() -> new JwtException("user not found"));
            return tokens(u);
        } catch (JwtException | IllegalArgumentException e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn");
        }
    }

    private AuthResponse tokens(User u) {
        return new AuthResponse(jwtService.generateAccessToken(u), jwtService.generateRefreshToken(u), UserDTO.from(u));
    }
}
