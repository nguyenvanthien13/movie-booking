package com.moviebooking.user;

public record UserDTO(Long id, String fullName, String email, String phone, Role role) {
    public static UserDTO from(User u) {
        return new UserDTO(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole());
    }
}
