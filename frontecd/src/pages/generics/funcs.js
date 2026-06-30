/**
 * Thiết lập tính năng tự động cuộn vô tận cho Slider bằng cơ chế dịch chuyển tọa độ ảo (Virtual Positioning)
 * Triệt tiêu hoàn toàn Layout Shift (CLS = 0)
 * @param {HTMLElement} el - Phần tử DOM của slider (sliderRef.current)
 * @param {Array} originalMovies - Danh sách phim gốc ban đầu từ API
 * @returns {Function} - Hàm cleanup để hủy các sự kiện và bộ đếm thời gian
 */
export const setupAutoScrollSlider = (el, originalMovies) => {
    if (!el || !originalMovies || originalMovies.length === 0) return () => { };

    let autoScrollTimeout = null;
    let scrollDebounceTimer = null;
    let isMouseInside = false;
    let isAutoScrolling = false;

    // Đã đồng bộ gap = 20 tương ứng class 'gap-5' trên giao diện mới
    const getOriginalWidth = () => {
        if (el.children.length === 0) return 0;
        const firstChild = el.children[0];
        const itemWidth = firstChild.getBoundingClientRect().width;
        const gap = 20; 
        return (itemWidth + gap) * originalMovies.length;
    };

    // 1. HÀM THỰC HIỆN CÚ LƯỚT TỰ ĐỘNG (Cuộn mượt khít từng phim một)
    const performAutoScroll = () => {
        if (isMouseInside) return;

        const originalWidth = getOriginalWidth();
        if (originalWidth === 0) return;

        // KIỂM TRA ĐIỂM CHẠM VÔ HẠN (VIRTUAL BOUNDARY RESET)
        if (el.scrollLeft >= originalWidth * 2) {
            el.scrollTo({ left: el.scrollLeft - originalWidth });
        }

        // Lấy chiều rộng của đúng 1 item phim đang hiển thị
        const firstChild = el.children[0];
        const itemWidth = firstChild ? firstChild.getBoundingClientRect().width : 220;
        const gap = 20; // Đã đồng bộ gap-5

        const scrollAmount = itemWidth + gap; // Chỉ cuộn vừa đúng khoảng cách của 1 phim

        isAutoScrolling = true;
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });

        // Chờ hiệu ứng chuyển động mượt hoàn tất (600ms) rồi mới đếm nhịp tiếp theo
        setTimeout(() => {
            isAutoScrolling = false;
            startAutoScroll();
        }, 600);
    };
    // 2. HÀM BẮT ĐẦU ĐẾM GIỜ
    const startAutoScroll = () => {
        stopAutoScroll();
        if (isMouseInside) return;

        autoScrollTimeout = setTimeout(performAutoScroll, 4000);
    };

    // 3. HÀM HỦY ĐẾM GIỜ
    const stopAutoScroll = () => {
        if (autoScrollTimeout) {
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = null;
        }
    };

    // 4. SỰ KIỆN TRÊN PC (DI CHUỘT)
    const handleMouseEnter = () => {
        isMouseInside = true;
        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
    };
    const handleMouseLeave = () => {
        isMouseInside = false;
        startAutoScroll();
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    // 5. SỰ KIỆN CUỘN THỦ CÔNG VÀ KIỂM SOÁT BIÊN ĐỘ VÔ HẠN
    const handleScroll = () => {
        const originalWidth = getOriginalWidth();
        if (originalWidth === 0) return;

        // Xử lý biên an toàn khi người dùng tự vuốt/cuộn tay sang 2 đầu cực của Slider
        if (el.scrollLeft >= originalWidth * 2) {
            el.scrollTo({ left: el.scrollLeft - originalWidth });
        } else if (el.scrollLeft <= 5) {
            el.scrollTo({ left: el.scrollLeft + originalWidth });
        }

        // Nếu cuộn do máy chạy tự động -> Bỏ qua không xử lý đè lên luồng thời gian
        if (isAutoScrolling) return;

        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);

        // Đợi người dùng vuốt dừng tay hẳn sau 1.5 giây thì tái kích hoạt tự động chạy tiếp
        scrollDebounceTimer = setTimeout(() => {
            if (!isMouseInside) {
                startAutoScroll();
            }
        }, 1500);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });

    // KHỞI CHẠY LẦN ĐẦU TIÊN: Đưa thanh cuộn về tọa độ cụm số 2 để người dùng có thể cuộn trái/phải vô tận ngay lập tức
    setTimeout(() => {
        const originalWidth = getOriginalWidth();
        if (el && originalWidth > 0 && el.scrollLeft === 0) {
            el.scrollTo({ left: originalWidth });
        }
        startAutoScroll();
    }, 150);

    // TRẢ VỀ HÀM CLEANUP ĐỂ GIẢI PHÓNG BỘ NHỚ CHO REACT COMPONENT
    return () => {
        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);

        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
        el.removeEventListener("scroll", handleScroll);
    };
};
