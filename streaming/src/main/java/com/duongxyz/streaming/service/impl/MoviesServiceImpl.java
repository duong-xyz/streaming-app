package com.duongxyz.streaming.service.impl;

import com.duongxyz.streaming.dto.MovieItemResponse;
import com.duongxyz.streaming.dto.MovieResponse;
import com.duongxyz.streaming.entity.Movies;
import com.duongxyz.streaming.form.MovieCreateForm;
import com.duongxyz.streaming.form.MovieFilterForm;
import com.duongxyz.streaming.form.MovieUpdateForm;
import com.duongxyz.streaming.mapper.MovieMapper;
import com.duongxyz.streaming.repository.MoviesRepository;
import com.duongxyz.streaming.service.MoviesService;
import com.duongxyz.streaming.specification.MovieSpecification;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MoviesServiceImpl implements MoviesService {
    private MoviesRepository moviesRepository;
    private MovieMapper movieMapper;

    // Lấy danh sách phim cho trang chủ (Cực nhẹ, dùng Method Reference 1 param)
    @Override
    public Page<MovieItemResponse> findAllMovieItems(MovieFilterForm form, Pageable pageable) {
        Specification spec = MovieSpecification.buildSpec(form);
        Page<Movies> moviePage = moviesRepository.findAll(spec, pageable);
        if (!moviePage.isEmpty()) {
            List<Long> MovieIds = moviePage.getContent().stream()
                    .map(Movies::getId)
                    .toList();
//            List<Object[]> episodeCounts = moviesRepository.countEpisodesByMovieIds(MovieIds);
//            Map<Long, Long> countMap = episodeCounts.stream().collect(Collectors.toMap(
//                    row -> (Long) row[0],
//                    row -> (Long) row[1]
//            ));
//            moviePage.forEach(movie -> {
//                Long count = countMap.getOrDefault(movie.getId(), 0L);
//                movie.setLatestEpisode(count.intValue());
//            });

            // 1. Gọi hàm lấy MAX thay vì COUNT
            List<Object[]> maxEpisodes = moviesRepository.findMaxEpisodeByMovieIds(MovieIds);

            // 2. Gom về Map<Long, Integer>. Ép kiểu row[1] về Integer (hoặc kiểu số tương ứng của trường số tập)
            Map<Long, Integer> maxEpisodeMap = maxEpisodes.stream().collect(Collectors.toMap(
                    row -> (Long) row[0],
                    row -> row[1] != null ? ((Number) row[1]).intValue() : 0
            ));

            // 3. Set số tập lớn nhất vào từng thực thể Movie
            moviePage.forEach(movie -> {
                Integer maxEpisode = maxEpisodeMap.getOrDefault(movie.getId(), 0);
                movie.setLatestEpisode(maxEpisode); // Không cần ép kiểu .intValue() nữa vì đã là Integer
            });
        }
        return moviePage.map(movieMapper::map);
    }

    // Lấy chi tiết một bộ phim (Đầy đủ thông tin, truyền thêm Class đích)
    @Override
    public MovieResponse findMovieById(Long id) {
        Movies movie = moviesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        return movieMapper.map(movie, MovieResponse.class); // Gọi Overloading 2 (2 tham số)
    }

    // 1. Tạo mới phim
    @Override
    public MovieResponse createMovie(MovieCreateForm form) {
        Movies movieEntity = movieMapper.map(form); // Gọi hàm map(MovieCreateForm)
        Movies savedMovie = moviesRepository.save(movieEntity);
        return movieMapper.map(savedMovie, MovieResponse.class);
    }

    // 2. Cập nhật phim
    @Override
    public MovieResponse updateMovie(Long id, MovieUpdateForm form) {
        Movies existingMovie = moviesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim"));

        movieMapper.map(form, existingMovie); // Gọi hàm map(MovieUpdateForm, Movies) để cập nhật dữ liệu trực tiếp vào entity

        Movies updatedMovie = moviesRepository.save(existingMovie);
        return movieMapper.map(updatedMovie, MovieResponse.class);
    }
    @Override
    public void delete(Long movieId) {
        moviesRepository.deleteById(movieId);
    }
}
