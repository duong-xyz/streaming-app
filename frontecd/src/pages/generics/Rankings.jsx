import { forwardRef, memo } from "react";

const Rankings = ({ dataState, navigate, TrophyOutlined, EyeOutlined }) => {
    const topMoviesList = Array.isArray(dataState?.topMovies) ? dataState.topMovies : [];

    return (
        <div className='space-y-4 select-none'>
            {/* TIÊU ĐỀ BẢNG XẾP HẠNG SANG TRỌNG */}
            <div className="border-b border-gray-900 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-amber-500 text-base drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                    <h2 className="text-sm md:text-base font-black text-gray-100 uppercase tracking-wider font-sans">
                        Bảng Xếp Hạng
                    </h2>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>

            {/* KHUNG NỀN CHỨA DANH SÁCH BOX */}
            <div className="bg-[#12141c] border border-gray-900/60 rounded-xl p-3.5 space-y-4 shadow-xl shadow-black/20">
                
                {/* KHUNG XƯƠNG DỌC KHI ĐANG TẢI (Khóa bố cục chống giật trang CLS) */}
                {dataState.loading && (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(5)].map((_, idx) => (
                            <div key={`skeleton-rank-${idx}`} className="flex items-center gap-4">
                                <div className="w-6 h-6 bg-slate-900/80 rounded-md shrink-0"></div>
                                <div className="w-10 h-14 bg-slate-900/60 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-3 bg-slate-900/80 rounded-md w-4/5"></div>
                                    <div className="h-2 bg-slate-900/40 rounded-md w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* HIỂN THỊ DỮ LIỆU BXH THẬT KHI ĐÃ TẢI XONG (LOADING = FALSE) */}
                {!dataState.loading && topMoviesList.length > 0 && topMoviesList.map((movie, index) => {
                    // Định nghĩa dải màu huy chương Gradient cho Top 3 cao cấp
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    const rankBadgeClass = isTop1
                        ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)] font-black'
                        : isTop2
                        ? 'bg-gradient-to-br from-gray-300 via-slate-400 to-slate-600 text-black font-black'
                        : isTop3
                        ? 'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 text-white font-black'
                        : 'bg-[#1a1d26] text-gray-400 font-bold border border-white/5';

                    return (
                        <div
                            key={`bxh-${movie?.id || index}`}
                            onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                            className="flex items-center gap-4 cursor-pointer group/bxh py-1.5 transition-all duration-300 rounded-lg hover:bg-white/[0.02] px-1"
                        >
                            {/* Số thứ tự hoặc Huy chương danh giá phong cách Donghua */}
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 select-none tracking-tighter ${rankBadgeClass}`}>
                                {index + 1}
                            </div>

                            {/* Ảnh thu nhỏ Thumbnail - Tinh chỉnh bo góc và viền gương */}
                            <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-950 shrink-0 border border-white/5 shadow-md group-hover/bxh:border-cyan-500/30 transition-colors duration-300">
                                <img
                                    src={movie?.thumbnailUrl || movie?.posterUrl || 'https://unsplash.com'}
                                    alt={movie?.title || 'Movie'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/bxh:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Khối chữ thông tin phân tầng */}
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                {/* Tiêu đề chính tiếng Việt */}
                                <h4 className="text-[12px] sm:text-xs font-bold text-gray-200 group-hover/bxh:text-cyan-400 transition-colors duration-300 truncate" title={movie?.title || ''}>
                                    {movie?.title || 'Chưa cập nhật'}
                                </h4>

                                {/* Tiêu đề phụ tiếng Anh hoặc Pinyin mờ nhẹ giống Slider chính */}
                                <span className="text-[9px] text-gray-500 font-medium font-sans truncate capitalize tracking-normal">
                                    {movie?.subTitle || movie?.originalTitle || 'Updating name...'}
                                </span>

                                {/* Trạng thái tập và lượt xem đã căn chỉnh khoảng cách gọn gàng */}
                                <div className="flex items-center justify-between text-[10px] font-sans mt-0.5 pt-0.5 border-t border-white/[0.03]">
                                    <span className="text-gray-400 font-semibold truncate max-w-[100px]">
                                        {movie?.latestEpisode !== undefined ? `Tập ${movie.latestEpisode} [4K]` : 'Hoạt hình 3D'}
                                    </span>
                                    <span className="text-orange-400/90 font-bold shrink-0 flex items-center gap-1">
                                        <EyeOutlined className="text-[9px] text-orange-500" /> 
                                        {movie?.viewsTotal ? Number(movie.viewsTotal).toLocaleString() : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(Rankings);
