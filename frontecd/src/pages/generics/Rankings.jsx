import React, { forwardRef, memo } from "react";

const Rankings = ({ dataState, navigate, TrophyOutlined, EyeOutlined }) => {
    const topMoviesList = Array.isArray(dataState?.topMovies) ? dataState.topMovies : [];

    return (
        <div className='space-y-4 select-none font-sans'>
            
            {/* TIÊU ĐỀ BẢNG XẾP HẠNG CHUẨN HALIM (Tone màu Ngọc Bích Jade đồng bộ với ListMovie) */}
            <div className="border-b border-[rgba(94,196,160,0.15)] pb-3 flex items-center justify-between text-[#5ec4a0]">
                <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-[#5ec4a0] text-base drop-shadow-[0_0_6px_rgba(94,196,160,0.4)]" />
                    <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-[#5ec4a0] drop-shadow-[0_0_16px_rgba(94,196,160,0.35)]">
                        Đang Sôi Nổi
                    </h2>
                </div>
                {/* Đèn tín hiệu nhấp nháy màu xanh ngọc bích Jade */}
                <span className="w-1.5 h-1.5 rounded-full bg-[#5ec4a0] animate-ping" />
            </div>

            {/* KHUNG NỀN CHỨA DANH SÁCH: màu mực sẫm mực đặc và bo viền vàng mờ */}
            <div className="bg-[rgba(14,10,28,0.82)] border border-[rgba(232,200,114,0.12)] rounded-xl p-3.5 space-y-4 shadow-2xl backdrop-blur-md">
                
                {/* KHUNG XƯƠNG DỌC SKELETON KHI ĐANG TẢI */}
                {dataState.loading && (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(5)].map((_, idx) => (
                            <div key={`skeleton-rank-${idx}`} className="flex items-center gap-4">
                                <div className="w-6 h-6 bg-neutral-800 rounded-md shrink-0"></div>
                                <div className="w-10 h-14 bg-neutral-800 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-3 bg-neutral-800 rounded w-4/5"></div>
                                    <div className="h-2 bg-neutral-800/50 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* HIỂN THỊ DỮ LIỆU BXH THẬT KHI ĐÃ TẢI XONG */}
                {!dataState.loading && topMoviesList.length > 0 && topMoviesList.map((movie, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    // Hệ thống Huy Chương bám sát dải màu Gradient Vàng Hổ Phách và Bạc mờ của trang gốc
                    const rankBadgeClass = isTop1
                        ? 'bg-gradient-to-br from-[#f0e4c8] via-[#e8c872] to-[#b8943f] text-[#0c0818] shadow-[0_0_12px_rgba(232,200,114,0.3)] font-black'
                        : isTop2
                        ? 'bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600 text-[#0c0818] font-black'
                        : isTop3
                        ? 'bg-gradient-to-br from-[#c4b896] via-[#a39775] to-[#7a6f54] text-white font-black'
                        : 'bg-[#0c0818] text-neutral-400 font-bold border border-[rgba(232,200,114,0.08)]';

                    return (
                        <div
                            key={`bxh-${movie?.id || index}`}
                            onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                            className="flex items-center gap-4 cursor-pointer group/bxh py-1.5 transition-all duration-200 rounded-lg hover:bg-white/[0.01] px-1"
                        >
                            {/* Số thứ tự Huy chương độc quyền */}
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 select-none tracking-tighter shadow-inner ${rankBadgeClass}`}>
                                {index + 1}
                            </div>

                            {/* Ảnh thu nhỏ Thumbnail:size w-10 h-14, scale ảnh */}
                            <div className="w-10 h-14 rounded-md overflow-hidden bg-neutral-950 shrink-0 border border-[rgba(232,200,114,0.15)] shadow-md group-hover/bxh:border-[#5ec4a0]/50 transition-colors duration-250">
                                <img
                                    src={movie?.thumbnailUrl || movie?.posterUrl || 'https://placehold.co'}
                                    alt={movie?.title || 'Movie'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/bxh:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Khối chữ thông tin phân tầng theo dải màu */}
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                {/* Tiêu đề phim tone màu Ngọc Bích Jade dịu mát khi hover */}
                                <h4 className="text-xs font-bold text-[#f0e4c8] group-hover/bxh:text-[#5ec4a0] transition-colors duration-250 truncate" title={movie?.title || ''}>
                                    {movie?.title || 'Chưa cập nhật'}
                                </h4>

                                <span className="text-[10px] text-[#c4b896] opacity-75 font-medium font-sans truncate capitalize tracking-normal">
                                    {movie?.subTitle || movie?.originalTitle || 'Đang cập nhật tên phụ...'}
                                </span>

                                {/* Trạng thái tập phim và lượt xem đồng bộ hệ màu ngọc */}
                                <div className="flex items-center justify-between text-[10px] font-sans mt-0.5 pt-0.5 border-t border-neutral-900">
                                    <span className="text-[#5ec4a0] font-bold truncate max-w-[100px]">
                                        {movie?.latestEpisode !== undefined ? `Tập ${movie.latestEpisode} [4K]` : 'Hoạt hình 3D'}
                                    </span>
                                    <span className="text-[#e8c872] font-bold shrink-0 flex items-center gap-1 opacity-90">
                                        <EyeOutlined className="text-[9px] text-[#e8c872]" /> 
                                        {movie?.viewsTotal ? Number(movie.viewsTotal).toLocaleString('vi-VN') : 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(Rankings);
