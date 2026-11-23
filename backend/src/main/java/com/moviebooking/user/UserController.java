package com.moviebooking.user;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    public record RoleRequest(@NotNull Role role) {}

    @GetMapping("/api/admin/users")
    public List<UserDTO> all() { return service.findAll(); }

    @PutMapping("/api/admin/users/{id}/role")
    public UserDTO changeRole(@PathVariable Long id, @RequestBody RoleRequest req, Authentication auth) {
        return service.changeRole(id, req.role(), auth.getName());
    }
}
