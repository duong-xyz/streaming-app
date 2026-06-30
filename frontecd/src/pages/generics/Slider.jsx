import { forwardRef, memo, useEffect, useMemo } from "react";
import { setupAutoScrollSlider } from "./funcs";

const Slider = forwardRef(({ dataState, navigate, LeftOutlined, PlayCircleFilled, RightOutlined }, ref) => {
    const sliderRef = ref;
    const moviesList = Array.isArray(dataState?.movies) ? dataState.movies : [];
    const isLoading = moviesList.length === 0;

    // GIẢI PHÁP SỬA LỖI: Lớn hơn 6 phim mới tiến hành nhân bản mảng tạo cuộn vô tận ảo
    const infiniteMovies = useMemo(() => {
        if (isLoading || moviesList.length === 0) return [];
        
        // 1. Luôn gán thứ hạng cố định chuẩn xác dựa trên danh sách gốc ban đầu (Top 1, Top 2, Top 3...)
        const ratedMovies = moviesList.map((movie, idx) => ({
            ...movie,
            originalRank: idx + 1
        }));

        // ĐIỀU KIỆN SỬA ĐỔI: Chỉ khi số lượng phim LỚN HƠN 6 mới nhân bản 3 lần. Nhỏ hơn hoặc bằng 6 phim thì GIỮ NGUYÊN (nhân bản 1 lần)
        const multiplier = ratedMovies.length > 5 ? 3 : 1;
        
        const extendedList = [];
        for (let i = 0; i < multiplier; i++) {
            extendedList.push(...ratedMovies);
        }

        // 3. Đính kèm virtualIndex độc nhất làm key để tránh lỗi lặp DOM trùng key trong React
        return extendedList.map((movie, idx) => ({
            ...movie,
            virtualIndex: idx
        }));
    }, [moviesList, isLoading]);

    // Chỉ kích hoạt tự động cuộn vô tận nếu danh sách phim lớn hơn 5 phần tử
    useEffect(() => {
        if (isLoading || moviesList.length <= 5) return;
        const cleanup = setupAutoScrollSlider(sliderRef.current, moviesList);
        return cleanup;
    }, [moviesList, isLoading, sliderRef]);

    return (
        <div className='relative group border-b border-gray-900 pb-4 min-h-[285px] sm:min-h-[345px] md:min-h-[375px]'>
            {/* Nút bấm slide sang trái - Ẩn đi nếu danh sách nhỏ hơn hoặc bằng 6 phim và không có nhu cầu cuộn */}
            {moviesList.length > 5 && (
                <button
                    onClick={() => {
                        if (sliderRef.current) {
                            const firstItem = sliderRef.current.firstElementChild;
                            const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 224;
                            const scrollAmount = itemWidth + 24; // 224px + 24px (1.5rem gap)
                            sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
                        }
                    }}
                    className='absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black border border-gray-800 shadow-xl'
                >
                    {LeftOutlined}
                </button>
            )}

            {/* Khung chứa Slider (Nếu nhỏ hơn hoặc bằng 6 phim, cho phép justify-center hoặc xả tràn tự nhiên không tự cuộn) */}
            <div
                ref={sliderRef}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                className={`halim-trending-track flex gap-6 overflow-x-auto flex-nowrap pb-6 pt-4 px-4 w-full select-none will-change-[transform,scroll-position] ${moviesList.length <= 6 ? 'sm:justify-start' : 'scroll-smooth'}`}
            >
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={`slider-skeleton-${idx}`}
                            className='halim-trending-card shrink-0 w-[180px] sm:w-[220px] md:w-[224px] aspect-[3/4] bg-[#26292e] overflow-hidden animate-pulse halim-trending-clip-path-even'
                        />
                    ))
                ) : (
                    infiniteMovies.map((movie, index) => {
                        const isFirstFewItems = index < 3;
                        
                        // Gọi thứ hạng gốc đã gán cố định, triệt tiêu lỗi lặp hiển thị hạng 1, 2, 1, 2
                        const rankNumber = movie.originalRank;

                        const isEvenIndex = index % 2 !== 0;
                        const clipPathClass = isEvenIndex 
                            ? "halim-trending-clip-path-even" 
                            : "halim-trending-clip-path-odd";

                        return (
                            <div
                                key={`slider-item-${movie?.id || movie.virtualIndex}-${movie.virtualIndex}`}
                                onClick={() => movie?.id && navigate(`/movie/${movie.id}`)}
                                className='halim-trending-card w-[180px] sm:w-[220px] md:w-[224px] shrink-0 flex flex-col group/item cursor-pointer snap-start relative'
                            >
                                <div className={`halim-trending-poster-container halim-trending-poster-loaded ${clipPathClass} w-full transition-transform duration-300 ease-out z-1`}>
                                    
                                    <img
                                        src={movie?.posterUrl}
                                        alt={movie?.title || 'Movie'}
                                        className='halim-trending-poster-image absolute inset-0 w-full h-full object-cover z-1'
                                        loading={isFirstFewItems ? "eager" : "lazy"}
                                        sizes="auto, (max-width: 480px) 180px, (max-width: 768px) 220px, 224px"
                                    />

                                    <div className='halim-trending-poster-mask' />
                                    
                                    <div className='absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[0.5px] z-2'>
                                        <div className='transform scale-75 group-hover/item:scale-100 transition-all duration-300 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] text-3xl'>
                                            {PlayCircleFilled}
                                        </div>
                                    </div>
                                    {/* 3. LỚP ĐÈ TEXT TRẠNG THÁI VÀ BADGE ĐIỂM SỐ (.halim-trending-rating) */}
                                    <div className='absolute inset-0 w-full h-full p-3 flex flex-col justify-between pointer-events-none z-3'>
                                        {/* Khối chứa trạng thái tập phim gốc trên trái */}
                                        <div className='flex flex-col gap-1 items-start'>
                                            {movie?.latestEpisode !== undefined && (
                                                <span className='bg-orange-600/95 backdrop-blur-sm text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md tracking-wider uppercase whitespace-nowrap border border-white/5'>
                                                    Tập {movie.latestEpisode} {movie.schedule || ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Khối chứa số điểm đánh giá góc dưới phải */}
                                        <div className='halim-trending-rating'>
                                            <span className='halim-trending-rating-value'>
                                                {movie?.rating || '4.6'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* KHU VỰC THÔNG TIN TIÊU ĐỀ (.halim-trending-info) NẰM NGOÀI KHUNG CHỨA POSTER */}
                                <div className='halim-trending-info'>
                                    {/* SỐ THỨ TỰ (RANK NUMBER) */}
                                    <div className='halim-trending-number'>
                                        {rankNumber}
                                    </div>

                                    {/* TIÊU ĐỀ PHÂN TẦNG (.halim-trending-details) */}
                                    <div className='halim-trending-details'>
                                        <h3 className='halim-trending-title-text' title={movie?.title || ''}>
                                            {movie?.title || 'Chưa cập nhật tên'}
                                        </h3>
                                        <span className='halim-trending-original-title'>
                                            {movie?.alternativeTitle || 'Updating name...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Nút bấm slide sang phải - Ẩn đi nếu danh sách nhỏ hơn hoặc bằng 6 phim */}
            {moviesList.length > 5 && (
                <button
                    onClick={() => {
                        if (sliderRef.current) {
                            const firstItem = sliderRef.current.firstElementChild;
                            const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 224;
                            const scrollAmount = itemWidth + 24; // 224px + 24px (1.5rem gap)
                            sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
                        }
                    }}
                    className='absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black border border-gray-800 shadow-xl'
                >
                    {RightOutlined}
                </button>
            )}
        </div>
    );
});

export default memo(Slider);
