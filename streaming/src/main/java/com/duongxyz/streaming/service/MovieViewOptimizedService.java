package com.duongxyz.streaming.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.stream.Collectors;

@Service
public class MovieViewOptimizedService {
    // limit the basket capacity in Ram to protect the system from memory overflow(OOM)
    private final BlockingQueue<Long> viewQueue = new LinkedBlockingDeque<>(50000);
    private final JdbcTemplate jdbcTemplate;
    private static final int BATCH_SIZE = 100; // The maximum grouping threshold is 100 click to process one instance

    public MovieViewOptimizedService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        startBackgroundWorker();
    }
    // Push movie IDs into asynchronous RAM basket (Response time < 0.1ms)
    public void incrementMovieView(Long movieId) {
        boolean success = viewQueue.offer(movieId);
        if(!success) System.err.println("The view processing system is overloaded! The queue is full");
    }
    // Real-time view calculation: Views in the database + Views currently queued in RAM
    public Long getRealTimeViews(Long movieId, Long dbViews) {
        Long pendingViews = viewQueue.stream()
                .filter(view -> view.equals(movieId))
                .count();
        return dbViews + pendingViews;
    }
    // Background stream cleans the data basket and pushes it to the db
    private void startBackgroundWorker() {
        Thread worker = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    List<Long> movieIds = new ArrayList<>();
                    // Blocking operation: If the basket is empty, the thread goes into hibernation using 0% CPU.
                    // When the first ball is entered, the thread immediately wakes up.
                    movieIds.add(viewQueue.take());
                    // Quickly scoop up the remaining 99 balls lined up right at that millisecond
                    viewQueue.drainTo(movieIds, BATCH_SIZE - 1);
                    // Group By: Transforms the flat array [1, 1, 2] into a Map {1 -> 2, 2 -> 1}
                    Map<Long, Long> viewCountsMap = movieIds.stream()
                            .collect(Collectors.groupingBy(id -> id, Collectors.counting()));
                    // Push the merged data packet to the DB
                    executeBatchUpdate(viewCountsMap);

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    // Protection shield: If the DB connection fails, the background thread will only write logs and will not die permanently.
                    System.err.println("System error when Batch Update View to DB: " + e.getMessage());
                }
            }
        });
        worker.setName("Movie-View-Worker-Thread");
        worker.setDaemon(true); // Automatically shuts down when the app is closed.
        worker.start();
    }

    private void executeBatchUpdate(Map<Long, Long> viewCountsMap) {
        if (viewCountsMap.isEmpty()) return;

        String sql = "UPDATE movies SET views_total = views_total + ? WHERE id = ?";
        List<Map.Entry<Long, Long>> batchItems = new ArrayList<>(viewCountsMap.entrySet());

        // Package the entire list into a single network request to send to the database.
        jdbcTemplate.batchUpdate(sql, batchItems, batchItems.size(),
                (ps, entry) -> {
                    ps.setLong(1, entry.getValue()); // How many more views
                    ps.setLong(2, entry.getKey());   // Which movieId is
                });
    }

}
