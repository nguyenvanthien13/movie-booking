package com.moviebooking.config;

import com.moviebooking.cinema.Cinema;
import com.moviebooking.cinema.CinemaRepository;
import com.moviebooking.movie.Movie;
import com.moviebooking.movie.MovieRepository;
import com.moviebooking.movie.MovieStatus;
import com.moviebooking.room.Room;
import com.moviebooking.room.RoomRepository;
import com.moviebooking.seat.SeatService;
import com.moviebooking.showtime.Showtime;
import com.moviebooking.showtime.ShowtimeRepository;
import com.moviebooking.user.Role;
import com.moviebooking.user.User;
import com.moviebooking.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** Nạp dữ liệu mẫu lần đầu chạy (khi bảng users còn trống). */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatService seatService;
    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        userRepository.save(User.builder().fullName("Quản trị viên").email("admin@moviebooking.com")
                .password(encoder.encode("Admin@123")).phone("0900000001").role(Role.ADMIN).build());
        userRepository.save(User.builder().fullName("Nguyễn Văn A").email("user@moviebooking.com")
                .password(encoder.encode("User@123")).phone("0900000002").role(Role.USER).build());

        LocalDate today = LocalDate.now();
        String[][] data = {
                {"Đêm Hà Nội", "Hình sự, Kịch tính", "118", "Một thám tử về hưu bị cuốn vào vụ án cũ trong những đêm mưa của thủ đô."},
                {"Mùa Hoa Cải", "Tình cảm, Gia đình", "105", "Hai chị em trở về quê sau nhiều năm xa cách và tìm lại những điều đã mất."},
                {"Chuyến Tàu Cuối", "Phiêu lưu", "126", "Một nhóm bạn lên chuyến tàu đêm xuyên Việt và gặp những biến cố không ngờ."},
                {"Bếp Lửa", "Hài, Đời sống", "98", "Quán cơm nhỏ đầu hẻm trước nguy cơ bị giải tỏa và những người khách quen."},
                {"Tiếng Vọng Từ Biển", "Kinh dị, Bí ẩn", "110", "Ngôi làng chài bên bờ biển nghe thấy tiếng gọi lạ mỗi khi triều lên."},
                {"Sài Gòn 2099", "Khoa học viễn tưởng", "132", "Thành phố của tương lai và một lập trình viên phát hiện ra bí mật của hệ thống."},
                {"Hạ Cuối", "Tình cảm", "101", "Câu chuyện tình tuổi đôi mươi trong mùa hè cuối cùng ở giảng đường."},
                {"Rồng Đất", "Hoạt hình, Gia đình", "95", "Cậu bé nông thôn và chú rồng nhỏ đi tìm dòng sông đã biến mất."},
        };
        List<Movie> movies = new ArrayList<>();
        for (int i = 0; i < data.length; i++) {
            boolean showing = i < 6;
            movies.add(movieRepository.save(Movie.builder().title(data[i][0]).genre(data[i][1])
                    .duration(Integer.parseInt(data[i][2])).description(data[i][3])
                    .posterUrl("https://picsum.photos/seed/movie" + (i + 1) + "/400/600")
                    .trailerUrl("https://www.youtube.com/results?search_query=official+trailer")
                    .releaseDate(showing ? today.minusDays(10L + i) : today.plusDays(14L + i))
                    .status(showing ? MovieStatus.NOW_SHOWING : MovieStatus.UPCOMING).build()));
        }

        List<Room> rooms = new ArrayList<>();
        String[][] cinemas = {{"Galaxy Hà Nội", "Số 1 Tràng Tiền, Hoàn Kiếm", "Hà Nội"}, {"Galaxy Sài Gòn", "Số 10 Nguyễn Huệ, Quận 1", "TP. Hồ Chí Minh"}};
        for (String[] c : cinemas) {
            Cinema cinema = cinemaRepository.save(Cinema.builder().name(c[0]).address(c[1]).city(c[2]).build());
            for (int r = 1; r <= 2; r++) {
                Room room = roomRepository.save(Room.builder().cinema(cinema).name("Phòng " + r)
                        .roomType(r == 1 ? "2D" : "IMAX").capacity(6 * 8).build());
                seatService.generateForRoom(room, 6, 8);
                rooms.add(room);
            }
        }

        LocalTime[] slots = {LocalTime.of(10, 0), LocalTime.of(14, 0), LocalTime.of(19, 30)};
        int idx = 0;
        for (int day = 0; day < 4; day++) {
            for (Room room : rooms) {
                for (LocalTime slot : slots) {
                    Movie m = movies.get(idx++ % 6);
                    LocalDateTime start = today.plusDays(day).atTime(slot);
                    if (start.isBefore(LocalDateTime.now())) continue;
                    BigDecimal price = new BigDecimal(room.getRoomType().equals("IMAX") ? "120000" : "85000");
                    showtimeRepository.save(Showtime.builder().movie(m).room(room).startTime(start)
                            .endTime(start.plusMinutes(m.getDuration() + 15L)).price(price).build());
                }
            }
        }
        log.info("Seeded demo data. Admin: admin@moviebooking.com / Admin@123 | User: user@moviebooking.com / User@123");
    }
}
