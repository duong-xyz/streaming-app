package com.duongxyz.streaming.service.impl;

import com.duongxyz.streaming.constant.MovieStatus;
import com.duongxyz.streaming.dto.MovieItemResponse;
import com.duongxyz.streaming.dto.MovieResponse;
import com.duongxyz.streaming.dto.ScheduleResponse;
import com.duongxyz.streaming.entity.Movies;
import com.duongxyz.streaming.form.MovieCreateForm;
import com.duongxyz.streaming.form.MovieFilterForm;
import com.duongxyz.streaming.form.MovieUpdateForm;
import com.duongxyz.streaming.mapper.MovieMapper;
import com.duongxyz.streaming.repository.MoviesRepository;
import com.duongxyz.streaming.service.MovieViewOptimizedService;
import com.duongxyz.streaming.service.MoviesService;
import com.duongxyz.streaming.specification.MovieSpecification;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
public class MoviesServiceImpl implements MoviesService {
    private MoviesRepository moviesRepository;
    private MovieMapper movieMapper;
    private final MovieViewOptimizedService movieViewOptimizedService;

    // Get a list of movies for the homepage (Extremely lightweight, using a 1-param Reference Method)
    @Override
    public Page<MovieItemResponse> findAllMovieItems(MovieFilterForm form, Pageable pageable) {
        Specification spec = MovieSpecification.buildSpec(form);
        Page<Movies> moviePage = moviesRepository.findAll(spec, pageable);
        if (!moviePage.isEmpty()) {
            List<Long> MovieIds = moviePage.getContent().stream()
                    .map(Movies::getId)
                    .toList();

            // 1. Call the MAX function instead of the COUNT function.
            List<Object[]> maxEpisodes = moviesRepository.findMaxEpisodeByMovieIds(MovieIds);
            // 2. Gom về Map<Long, Integer>. Ép kiểu row[1] về Integer (or kiểu số tương ứng của trường số tập)
            Map<Long, Integer> maxEpisodeMap = maxEpisodes.stream().collect(Collectors.toMap(
                    row -> (Long) row[0],
                    row -> row[1] != null ? ((Number) row[1]).intValue() : 0
            ));
            // 3. Set số tập biggest vào từng thực thể Movie
            moviePage.forEach(movie -> {
                Integer maxEpisode = maxEpisodeMap.getOrDefault(movie.getId(), 0);
                movie.setLatestEpisode(maxEpisode); // There's no need to cast .intValue() anymore since it's already an Integer
            });
        }
        return moviePage.map(movieMapper::map);
    }

    // Get details of a movie (Complete information, pass in the target Class)
    // OPTIMIZATION: Display the total number of views in real-time for users.
    @Override
    public MovieResponse findMovieById(Long id) {
        Movies movie = moviesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        Long realTimeViews = movieViewOptimizedService.getRealTimeViews(movie.getId(), movie.getViewsTotal());
        movie.setViewsTotal(realTimeViews);
        return movieMapper.map(movie, MovieResponse.class); //Overloading(2 parameters)
    }

    @Override
    public MovieResponse createMovie(MovieCreateForm form) {
        Movies movieEntity = movieMapper.map(form);
        Movies savedMovie = moviesRepository.save(movieEntity);
        return movieMapper.map(savedMovie, MovieResponse.class);
    }

    @Override
    public MovieResponse updateMovie(Long id, MovieUpdateForm form) {
        Movies existingMovie = moviesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie is not found"));

        movieMapper.map(form, existingMovie); // update data directly to the entity
        Movies updatedMovie = moviesRepository.save(existingMovie);
        return movieMapper.map(updatedMovie, MovieResponse.class);
    }
    @Override
    public void delete(Long movieId) {
        moviesRepository.deleteById(movieId);
    }
    // Implement a function to push clicks into the asynchronous RAM queue
    @Override
    public void incrementViewTotals(Long movieId) {
        movieViewOptimizedService.incrementMovieView(movieId);
    }

    @Override
    public ScheduleResponse getScheduleByDay(String currentDay, Pageable pageable) {
        List<Movies> activeMovies = moviesRepository.findByStatus(MovieStatus.SHOWING);
        if (activeMovies.isEmpty()) {
            return new ScheduleResponse(Page.empty(pageable), Page.empty(pageable));
        }
        List<Movies> showingTodayEntities = activeMovies.stream()
                .filter(m -> m.hasScheduleAt(currentDay, false))
                .toList();
        List<Movies> showingEarlyEntities = activeMovies.stream()
                .filter(m -> m.hasScheduleAt(currentDay, true))
                .toList();
        // In-Memory Pagination
        Page<Movies> todayMoviePage = paginateList(showingTodayEntities, pageable);
        Page<Movies> earlyMoviePage = paginateList(showingEarlyEntities, pageable);

        List<Long> pagedMovieIds = Stream.concat(
                todayMoviePage.getContent().stream(),
                earlyMoviePage.getContent().stream())
                .map(Movies::getId)
                .distinct().toList();

        if (!pagedMovieIds.isEmpty()) {
            List<Object[]> maxEpisodes = moviesRepository.findMaxEpisodeByMovieIds(pagedMovieIds);
            Map<Long, Integer> maxEpisodeMap = maxEpisodes.stream().collect(Collectors.toMap(
                    row -> (Long) row[0],
                    row -> row[1] != null ? ((Number) row[1]).intValue() : 0
            ));
            Consumer<Movies> setLatestEp = movie ->
                    movie.setLatestEpisode(maxEpisodeMap.getOrDefault(movie.getId(), 0));
            todayMoviePage.forEach(setLatestEp);
            earlyMoviePage.forEach(setLatestEp);
        }
        Page<MovieItemResponse> moviesShowingToday = todayMoviePage.map(movieMapper::map);
        Page<MovieItemResponse> moviesShowingEarly = earlyMoviePage.map(movieMapper::map);
        return new ScheduleResponse(moviesShowingToday, moviesShowingEarly);
    }

    // Utility function to trim the list (SubList) based on the Pageable offset
    private Page<Movies> paginateList(List<Movies> originalList, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), originalList.size());

        List<Movies> pagedContent = new ArrayList<>();
        if (start < originalList.size()) {
            pagedContent = originalList.subList(start, end);
        }

        return new PageImpl<>(pagedContent, pageable, originalList.size());
    }

}
