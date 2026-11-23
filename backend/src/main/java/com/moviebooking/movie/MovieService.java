package com.moviebooking.movie;

import com.moviebooking.common.AppException;
import com.moviebooking.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository repo;

    public PageResponse<MovieDTO> search(String q, MovieStatus status, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "id"));
        String keyword = q == null ? "" : q.trim();
        var result = status == null
                ? repo.findByTitleContainingIgnoreCase(keyword, pageable)
                : repo.findByTitleContainingIgnoreCaseAndStatus(keyword, status, pageable);
        return PageResponse.of(result, MovieMapper::toDTO);
    }

    public List<MovieDTO> byStatus(MovieStatus status) {
        return repo.findByStatusOrderByReleaseDateDesc(status).stream().map(MovieMapper::toDTO).toList();
    }

    public MovieDTO get(Long id) {
        return MovieMapper.toDTO(find(id));
    }

    public Movie find(Long id) {
        return repo.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy phim #" + id));
    }

    @Transactional
    public MovieDTO create(MovieDTO dto) {
        Movie m = new Movie();
        MovieMapper.apply(dto, m);
        return MovieMapper.toDTO(repo.save(m));
    }

    @Transactional
    public MovieDTO update(Long id, MovieDTO dto) {
        Movie m = find(id);
        MovieMapper.apply(dto, m);
        return MovieMapper.toDTO(m);
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
        repo.flush(); // để lỗi khoá ngoại (phim đã có suất chiếu) được bắt ngay
    }
}
