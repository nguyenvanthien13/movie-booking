package com.moviebooking.cinema;

import com.moviebooking.common.AppException;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CinemaService {
    private final CinemaRepository repo;

    public record CinemaDTO(Long id, @NotBlank(message = "Tên rạp không được để trống") String name, String address, String city) {
        static CinemaDTO from(Cinema c) { return new CinemaDTO(c.getId(), c.getName(), c.getAddress(), c.getCity()); }
    }

    public List<CinemaDTO> findAll() { return repo.findAll().stream().map(CinemaDTO::from).toList(); }

    public Cinema find(Long id) { return repo.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy rạp #" + id)); }

    public CinemaDTO get(Long id) { return CinemaDTO.from(find(id)); }

    @Transactional
    public CinemaDTO create(CinemaDTO d) {
        return CinemaDTO.from(repo.save(Cinema.builder().name(d.name()).address(d.address()).city(d.city()).build()));
    }

    @Transactional
    public CinemaDTO update(Long id, CinemaDTO d) {
        Cinema c = find(id);
        c.setName(d.name()); c.setAddress(d.address()); c.setCity(d.city());
        return CinemaDTO.from(c);
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
        repo.flush();
    }
}
