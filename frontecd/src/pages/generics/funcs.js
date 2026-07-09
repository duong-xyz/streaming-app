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

    // Tự động lấy Gap thực tế từ CSS computed style, tránh lệch vị trí lũy tiến
    const getLayoutMetrics = () => {
        if (!el || el.children.length === 0) return { itemWidth: 0, gap: 0, originalWidth: 0 };
        
        const firstChild = el.children[0];
        const itemWidth = firstChild.getBoundingClientRect().width;
        
        // Đọc giá trị khoảng cách thực tế từ trình duyệt
        const computedStyle = window.getComputedStyle(el);
        const gap = parseFloat(computedStyle.columnGap) || 0; 
        
        const originalWidth = (itemWidth + gap) * originalMovies.length;
        return { itemWidth, gap, originalWidth };
    };

    // HÀM THỰC HIỆN CÚ LƯỚT TỰ ĐỘNG
    const performAutoScroll = () => {
        if (isMouseInside) return;

        const { itemWidth, gap, originalWidth } = getLayoutMetrics();
        if (originalWidth === 0) return;

        // Ép buộc trình duyệt nhảy tọa độ tức thời (`behavior: "instant"`)
        // Triệt tiêu hoàn toàn hiệu ứng cuộn ngược gây giật mắt người dùng khi reset biên
        if (el.scrollLeft >= originalWidth * 2) {
            el.scrollTo({ left: el.scrollLeft - originalWidth, behavior: "instant" });
        }

        const scrollAmount = itemWidth + gap;

        isAutoScrolling = true;
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });

        // Kiểm tra trạng thái chuột trước khi kích hoạt vòng lặp tiếp theo
        // thời gian chờ 650ms để đảm bảo hiệu ứng mượt của trình duyệt kết thúc hẳn
        setTimeout(() => {
            isAutoScrolling = false;
            if (!isMouseInside) {
                startAutoScroll();
            }
        }, 650);
    };

    // HÀM BẮT ĐẦU ĐẾM GIỜ
    const startAutoScroll = () => {
        stopAutoScroll();
        if (isMouseInside) return;

        autoScrollTimeout = setTimeout(performAutoScroll, 4000);
    };

    // HÀM HỦY ĐẾM GIỜ
    const stopAutoScroll = () => {
        if (autoScrollTimeout) {
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = null;
        }
    };

    // SỰ KIỆN TRÊN PC (DI CHUỘT)
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

    // SỰ KIỆN CUỘN THỦ CÔNG VÀ KIỂM SOÁT BIÊN ĐỘ VÔ HẠN
    const handleScroll = () => {
        const { originalWidth } = getLayoutMetrics();
        if (originalWidth === 0) return;

        // `behavior: "instant"` khi người dùng vuốt tay chạm biên cực đại
        if (el.scrollLeft >= originalWidth * 2) {
            el.scrollTo({ left: el.scrollLeft - originalWidth, behavior: "instant" });
        } else if (el.scrollLeft <= 5) {
            el.scrollTo({ left: el.scrollLeft + originalWidth, behavior: "instant" });
        }

        if (isAutoScrolling) return;

        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);

        // Đợi người dùng dừng thao tác vuốt 1.5 giây rồi chạy tiếp tự động
        scrollDebounceTimer = setTimeout(() => {
            if (!isMouseInside) {
                startAutoScroll();
            }
        }, 1500);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });

    // độ trễ lên 300ms để đảm bảo các thiết bị cấu hình thấp kịp tính toán hình ảnh hình học
    // Đồng thời lưu trữ biến timer để dọn dẹp trong hàm cleanup
    const initTimeout = setTimeout(() => {
        const { originalWidth } = getLayoutMetrics();
        if (el && originalWidth > 0 && el.scrollLeft === 0) {
            el.scrollTo({ left: originalWidth, behavior: "instant" });
        }
        startAutoScroll();
    }, 300);

    // TRẢ VỀ HÀM CLEANUP ĐỂ GIẢI PHÓNG BỘ NHỚ CHO REACT COMPONENT
    return () => {
        clearTimeout(initTimeout);
        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);

        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
        el.removeEventListener("scroll", handleScroll);
    };
};







/**
 * Thiết lập tính năng tự động cuộn vô探索 cho Slider bằng cơ chế dịch chuyển tọa độ ảo (Virtual Positioning)
 * Triệt tiêu hoàn toàn Layout Shift (CLS = 0)
 * @param {HTMLElement} el - Phần tử DOM của slider (sliderRef.current)
 * @param {Array} originalMovies - Danh sách phim gốc ban đầu từ API
 * @returns {Function} - Hàm cleanup để hủy các sự kiện và bộ đếm thời gian
 */
export const setupAutoScrollSlider2 = (el, originalMovies) => {
    if (!el || !originalMovies || originalMovies.length === 0) return () => { };

    let autoScrollTimeout = null;
    let scrollDebounceTimer = null;
    let isMouseInside = false;
    let isAutoScrolling = false;

    // TỐC ĐỘ: Thời gian (ms) để slider hoàn thành cú lướt qua một ô phim
    // 800 đến 1200ms là khoảng thời gian cho hiệu ứng mượt mượt chuẩn jQuery nhất
    const JQUERY_ANIMATION_DURATION = 1000; 

    // Tự động lấy Gap thực tế từ CSS computed style, tránh lệch vị trí lũy tiến
    const getLayoutMetrics = () => {
        if (!el || el.children.length === 0) return { itemWidth: 0, gap: 0, originalWidth: 0 };
        
        const firstChild = el.children[0];
        const itemWidth = firstChild.getBoundingClientRect().width;
        
        // Đọc giá trị khoảng cách thực tế từ trình duyệt
        const computedStyle = window.getComputedStyle(el);
        const gap = parseFloat(computedStyle.columnGap) || 0; 
        
        const originalWidth = (itemWidth + gap) * originalMovies.length;
        return { itemWidth, gap, originalWidth };
    };

    // HÀM BỔ TRỢ: MÔ PHỎNG CÚ LƯỚT MƯỢT KIỂU JQUERY ANIMATE
    const customScrollTo = (targetEl, targetLeft, duration) => {
        const startLeft = targetEl.scrollLeft;
        const distance = targetLeft - startLeft;
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Công thức Thuật toán Ease-In-Out chuẩn (Chạy chậm lúc đầu -> nhanh ở giữa -> chậm lại khi dừng)
            const easeInOutQuad = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            targetEl.scrollLeft = startLeft + distance * easeInOutQuad;

            if (elapsed < duration) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    };

    // HÀM THỰC HIỆN CÚ LƯỚT TỰ ĐỘNG
    const performAutoScroll = () => {
        if (isMouseInside) return;

        const { itemWidth, gap, originalWidth } = getLayoutMetrics();
        if (originalWidth === 0) return;

        // Ép buộc trình duyệt nhảy tọa độ tức thời (`behavior: "instant"`)
        // Triệt tiêu hoàn toàn hiệu ứng cuộn ngược gây giật mắt người dùng khi reset biên
        if (el.scrollLeft >= originalWidth * 2) {
            el.scrollTo({ left: el.scrollLeft - originalWidth, behavior: "instant" });
        }

        const scrollAmount = itemWidth + gap;

        isAutoScrolling = true;
        
        // SỬA TẠI ĐÂY: Thay thế el.scrollBy mặc định bằng hàm lướt mượt tùy biến
        customScrollTo(el, el.scrollLeft + scrollAmount, JQUERY_ANIMATION_DURATION);

        // Kiểm tra trạng thái chuột trước khi kích hoạt vòng lặp tiếp theo
        // Thời gian chờ được đồng bộ tự động theo thời gian chuyển động để khóa cờ hiệu chuẩn xác
        setTimeout(() => {
            isAutoScrolling = false;
            if (!isMouseInside) {
                startAutoScroll();
            }
        }, JQUERY_ANIMATION_DURATION + 50);
    };

    // HÀM BẮT ĐẦU ĐẾM GIỜ (Vẫn giữ nguyên 4 giây đứng im chờ lướt)
    const startAutoScroll = () => {
        stopAutoScroll();
        if (isMouseInside) return;

        autoScrollTimeout = setTimeout(performAutoScroll, 4000);
    };

    // HÀM HỦY ĐẾM GIỜ
    const stopAutoScroll = () => {
        if (autoScrollTimeout) {
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = null;
        }
    };

    // SỰ KIỆN TRÊN PC (DI CHUỘT)
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

    // SỰ KIỆN CUỘN THỦ CÔNG VÀ KIỂM SOÁT BIÊN ĐỘ VÔ HẠN
    const handleScroll = () => {
        const { originalWidth } = getLayoutMetrics();
        if (originalWidth === 0) return;

        // `behavior: "instant"` khi người dùng vuốt tay chạm biên cực đại
        if (el.scrollLeft >= originalWidth * 2) {
            el.scrollTo({ left: el.scrollLeft - originalWidth, behavior: "instant" });
        } else if (el.scrollLeft <= 5) {
            el.scrollTo({ left: el.scrollLeft + originalWidth, behavior: "instant" });
        }

        if (isAutoScrolling) return;

        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);

        // Đợi người dùng dừng thao tác vuốt 1.5 giây rồi chạy tiếp tự động
        scrollDebounceTimer = setTimeout(() => {
            if (!isMouseInside) {
                startAutoScroll();
            }
        }, 1500);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });

    // độ trễ lên 300ms để đảm bảo các thiết bị cấu hình thấp kịp tính toán hình ảnh hình học
    // Đồng thời lưu trữ biến timer để dọn dẹp trong hàm cleanup
    const initTimeout = setTimeout(() => {
        const { originalWidth } = getLayoutMetrics();
        if (el && originalWidth > 0 && el.scrollLeft === 0) {
            el.scrollTo({ left: originalWidth, behavior: "instant" });
        }
        startAutoScroll();
    }, 300);

    // TRẢ VỀ HÀM CLEANUP ĐỂ GIẢI PHÓNG BỘ NHỚ CHO REACT COMPONENT
    return () => {
        clearTimeout(initTimeout);
        stopAutoScroll();
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);

        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
        el.removeEventListener("scroll", handleScroll);
    };
};



