package com.moviebooking.user;

import com.moviebooking.common.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repo;

    public User getByEmail(String email) {
        return repo.findByEmail(email).orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
    }

    public List<UserDTO> findAll() {
        return repo.findAll().stream().map(UserDTO::from).toList();
    }

    @Transactional
    public UserDTO changeRole(Long id, Role role, String currentEmail) {
        User u = repo.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));
        if (u.getEmail().equals(currentEmail)) throw AppException.badRequest("Không thể tự đổi quyền của chính mình");
        u.setRole(role);
        return UserDTO.from(u);
    }
}
