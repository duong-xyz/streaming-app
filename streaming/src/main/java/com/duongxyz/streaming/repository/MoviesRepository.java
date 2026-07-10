package com.duongxyz.streaming.repository;

import com.duongxyz.streaming.constant.MovieStatus;
import com.duongxyz.streaming.entity.Movies;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MoviesRepository
        extends JpaRepository<Movies, Long>, JpaSpecificationExecutor<Movies> {

    List<Movies> findByStatus(MovieStatus status);
    // CHỈ ĐẾM: Trả về danh sách gồm cặp [ID phim, Số lượng tập] của 12 phim
    @Query("SELECT e.movie.id, COUNT(e) FROM Episodes e WHERE e.movie.id IN :movieIds GROUP BY e.movie.id")
    List<Object[]> countEpisodesByMovieIds(@Param("movieIds") List<Long> movieIds);

    // Trong MoviesRepository.java
    @Query("SELECT e.movie.id, MAX(e.episodeNumber) FROM Episodes e WHERE e.movie.id IN :movieIds GROUP BY e.movie.id")
    List<Object[]> findMaxEpisodeByMovieIds(@Param("movieIds") List<Long> movieIds);


    // Chỉ giữ lại hàm custom này để ép Hibernate dùng đúng 1 câu lệnh LEFT JOIN FETCH cho danh sách ID
//    @Query("SELECT DISTINCT m FROM Movies m LEFT JOIN FETCH m.episodes WHERE m.id IN :movieIds")
//    List<Movies> findAllAndFetchEpisodes(@Param("movieIds") List<Long> movieIds);

    /*// Tạo trực tiếp object MovieItemResponse từ câu lệnh SQL
    // Lưu ý: Các trường truyền vào new phải khớp thứ tự với AllArgsConstructor của MovieItemResponse
    @Query("SELECT new com.duongxyz.streaming.dto.MovieItemResponse(" +
            "m.id, m.title, m.alternativeTitle, m.thumbnailUrl, m.posterUrl, " +
            "m.status, m.schedule, m.viewsTotal, m.createdAt, m.updatedAt) " +
            "FROM Movies m")
    List<MovieItemResponse> findAllMovieItems();*/
}
