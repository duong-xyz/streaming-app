package com.duongxyz.streaming.config;

import com.duongxyz.streaming.constant.EpisodeStatus;
import com.duongxyz.streaming.constant.MovieStatus;
import com.duongxyz.streaming.constant.UserRole;
import com.duongxyz.streaming.entity.*;
import com.duongxyz.streaming.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class MyConfiguration {

    @Bean
    CommandLineRunner initDatabase(
            UsersRepository userRepository,
            MoviesRepository movieRepository,
            EpisodesRepository episodeRepository,
            VideoQualitiesRepository videoQualityRepository,
            BCryptPasswordEncoder passwordEncoder) {

        return args -> {
            if (!userRepository.existsById(1L)) {
                Users admin = Users.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("111111"))
                        .email("duong@xyz.com")
                        .role(UserRole.ADMIN)
                        .build();
                userRepository.save(admin);
            }

            // KHỞI TẠO 1 ROW CHO BẢNG MOVIES VÀ 1 ROW CHO BẢNG EPISODES
            boolean isNewMovieCreated = false;
            Movies savedMovie = null;

            if (!movieRepository.existsById(1L)) {
                // Khởi tạo thực thể bộ phim (Movies)
                Movies movie = Movies.builder()
                        .title("Phim Mẫu Demo")
                        .alternativeTitle("Demo Movie Sub")
                        .description("Đây là mô tả ngắn cho bộ phim mẫu của hệ thống.")
                        .thumbnailUrl("https://xyz.com")
                        .posterUrl("https://xyz.com")
                        .status(MovieStatus.COMING_SOON)
                        .schedule("Thứ 7 hàng tuần")
                        .build();

                // Khởi tạo thực thể tập phim (Episodes)
                Episodes episode = Episodes.builder()
                        .episodeNumber(1)
                        .title("Tập 1: Khởi Đầu")
                        .status(EpisodeStatus.PROCESSING)
                        .build();

                // Sử dụng hàm tiện ích trong Entity Movies để thiết lập quan hệ 2 chiều
                movie.addEpisode(episode);

                // Lưu và ép Hibernate đồng bộ ngay lập tức xuống DB để lấy ID tự tăng
                savedMovie = movieRepository.saveAndFlush(movie);
                isNewMovieCreated = true;
            } else {
                // Nếu phim đã có sẵn trong DB từ lần chạy trước
                savedMovie = movieRepository.findById(1L).orElse(null);
            }

            // KHỞI TẠO 1 ROW CHO BẢNG VIDEO_QUALITIES
            if (!videoQualityRepository.existsById(1L)) {
                Episodes currentEpisode = null;

                if (isNewMovieCreated && savedMovie != null) {
                    // Lần đầu chạy ứng dụng: Lấy trực tiếp từ đối tượng Java vừa flush (vẫn nằm trong Persistence Context)
                    currentEpisode = savedMovie.getEpisodes().get(0);
                } else {
                    // Lần sau chạy lại: Sử dụng repository để query trực tiếp từ DB.
                    // Giải pháp này giúp tránh lỗi LazyInitializationException do danh sách episodes của Movies là LAZY fetch.
                    currentEpisode = episodeRepository.findAll().stream()
                            .filter(ep -> ep.getMovie() != null && ep.getMovie().getId().equals(1L))
                            .findFirst()
                            .orElse(null);
                }

                // Tiến hành lưu dữ liệu mẫu cho Video Quality khi tìm thấy tập phim hợp lệ làm khóa ngoại
                if (currentEpisode != null) {
                    VideoQualities videoQuality = VideoQualities.builder()
                            .quality("1080p")
                            .m3u8Url("https://xyz.com")
                            .episode(currentEpisode)
                            .build();

                    videoQualityRepository.save(videoQuality);
                }
            }
        };
    }
}
