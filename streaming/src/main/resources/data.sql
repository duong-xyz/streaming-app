-- =========================================================================
-- 1. KHỞI TẠO DỮ LIỆU BẢNG USERS
-- =========================================================================
SET IDENTITY_INSERT users ON;

IF NOT EXISTS (SELECT 1 FROM users WHERE id = 1)
    INSERT INTO users (id, username, password, email, role, created_at, updated_at)
    -- pass: 111111
    VALUES (1, 'admin', '111111', 'duong@xyz.com', 10, GETDATE(), GETDATE()); -- 10 ứng với ADMIN

IF NOT EXISTS (SELECT 1 FROM users WHERE id = 2)
    INSERT INTO users (id, username, password, email, role, created_at, updated_at)
    -- pass: hashed_password_456
    VALUES (2, 'moviefan', '111111', 20, GETDATE(), GETDATE()); -- 20 ứng với USER

SET IDENTITY_INSERT users OFF;


-- =========================================================================
-- 2. KHỞI TẠO DỮ LIỆU BẢNG MOVIES
-- =========================================================================
SET IDENTITY_INSERT movies ON;

IF NOT EXISTS (SELECT 1 FROM movies WHERE id = 1)
    INSERT INTO movies (id, title, alternative_title, description, thumbnail_url, poster_url, status, schedule, views_total, created_at, updated_at)
    VALUES (1, N'Chiến Binh Ánh Sáng', 'Light Warrior', N'Bộ phim hành động viễn tưởng đỉnh cao năm 2026.', 'https://yanhh3d.ee/wp-content/uploads/2025/04/Tien-Nghich-300x450.webp', 'https://yanhh3d.ee/wp-content/uploads/2025/04/Tien-Nghich-300x450.webp', 'COMING_SOON', N'Tối thứ 7 hàng tuần', 0, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM movies WHERE id = 2)
    INSERT INTO movies (id, title, alternative_title, description, thumbnail_url, poster_url, status, schedule, views_total, created_at, updated_at)
    VALUES (2, N'Hành Trình Vô Tận', 'Endless Journey', N'Phim tài liệu khám phá vũ trụ sâu thẳm.', 'https://image.com', 'https://image.com', 'COMING_SOON', N'Đã trọn bộ', 1500, GETDATE(), GETDATE());

SET IDENTITY_INSERT movies OFF;


-- =========================================================================
-- 3. KHỞI TẠO DỮ LIỆU BẢNG EPISODES
-- =========================================================================
SET IDENTITY_INSERT episodes ON;

IF NOT EXISTS (SELECT 1 FROM episodes WHERE id = 1)
    INSERT INTO episodes (id, episode_number, title, views, status, movie_id, created_at, updated_at)
    VALUES (1, 1, N'Tập 1: Khởi Đầu Mới', 120, 'PROCESSING', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM episodes WHERE id = 2)
    INSERT INTO episodes (id, episode_number, title, views, status, movie_id, created_at, updated_at)
    VALUES (2, 2, N'Tập 2: Thử Thách Đầu Tiên', 85, 'PROCESSING', 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM episodes WHERE id = 3)
    INSERT INTO episodes (id, episode_number, title, views, status, movie_id, created_at, updated_at)
    VALUES (3, 1, N'Tập Toàn Tập', 1500, 'PROCESSING', 2, GETDATE(), GETDATE());

SET IDENTITY_INSERT episodes OFF;


-- =========================================================================
-- 4. KHỞI TẠO DỮ LIỆU BẢNG VIDEO_QUALITIES
-- =========================================================================
SET IDENTITY_INSERT video_qualities ON;

IF NOT EXISTS (SELECT 1 FROM video_qualities WHERE id = 1)
    INSERT INTO video_qualities (id, quality, m3u8_url, episode_id) VALUES (1, '1080p', 'https://xyz.com', 1);

IF NOT EXISTS (SELECT 1 FROM video_qualities WHERE id = 2)
    INSERT INTO video_qualities (id, quality, m3u8_url, episode_id) VALUES (2, '720p', 'https://xyz.com', 1);

IF NOT EXISTS (SELECT 1 FROM video_qualities WHERE id = 3)
    INSERT INTO video_qualities (id, quality, m3u8_url, episode_id) VALUES (3, '1080p', 'https://xyz.com', 2);

IF NOT EXISTS (SELECT 1 FROM video_qualities WHERE id = 4)
    INSERT INTO video_qualities (id, quality, m3u8_url, episode_id) VALUES (4, '1080p', 'https://xyz.com', 3);

SET IDENTITY_INSERT video_qualities OFF;


-- =========================================================================
-- 5. KHỞI TẠO DỮ LIỆU BẢNG COMMENTS
-- =========================================================================
SET IDENTITY_INSERT comments ON;

-- Bước 5.1: Bình luận gốc (parent_id = NULL)
IF NOT EXISTS (SELECT 1 FROM comments WHERE id = 1)
    INSERT INTO comments (id, content, user_id, episode_id, parent_id, created_at, updated_at)
    VALUES (1, N'Phim hay quá mọi người ơi, hóng tập tiếp theo ghê!', 1, 1, NULL, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM comments WHERE id = 2)
    INSERT INTO comments (id, content, user_id, episode_id, parent_id, created_at, updated_at)
    VALUES (2, N'Kỹ xảo đoạn đầu hơi giả nhưng nội dung bù lại tốt.', 2, 1, NULL, GETDATE(), GETDATE());

-- Bước 5.2: Bình luận phản hồi (Replies)
IF NOT EXISTS (SELECT 1 FROM comments WHERE id = 3)
    INSERT INTO comments (id, content, user_id, episode_id, parent_id, created_at, updated_at)
    VALUES (3, N'Đúng vậy bạn ơi, mình cũng đang hóng xỉu.', 2, 1, 1, GETDATE(), GETDATE());

IF NOT EXISTS (SELECT 1 FROM comments WHERE id = 4)
    INSERT INTO comments (id, content, user_id, episode_id, parent_id, created_at, updated_at)
    VALUES (4, N'Mình thấy kỹ xảo vậy là ổn so với tầm giá rồi á.', 1, 1, 2, GETDATE(), GETDATE());

SET IDENTITY_INSERT comments OFF;
