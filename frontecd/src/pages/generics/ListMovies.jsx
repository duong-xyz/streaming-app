import React, { forwardRef, memo } from "react";
import {
    ExclamationCircleOutlined, PlayCircleOutlined, ScheduleOutlined,
    EyeOutlined, LeftOutlined, RightOutlined, CalendarOutlined
} from '@ant-design/icons';

const ListMovie = ({ dataState, navigate, handlePageChange, currentPage }) => {
    const moviesList = Array.isArray(dataState?.movies) ? dataState.movies : [];
    const totalPages = dataState?.totalPages || 1;

    return (
        <div className='lg:col-span-3 space-y-5 select-none font-sans'>
            
            {/* THANH ĐIỀU HƯỚNG BỘ LỌC HALIM (Đường gạch mảnh màu Ngọc Bích Jade bừng sáng phía dưới) */}
            <div className="flex items-center gap-3 mb-4.5 pb-3 border-b border-[rgba(94,196,160,0.15)] text-[#5ec4a0]">
                <CalendarOutlined className="text-[17px] text-[#5ec4a0] drop-shadow-[0_0_6px_rgba(94,196,160,0.4)]" />
                <span className="text-sm font-bold tracking-[2px] uppercase text-[#5ec4a0] drop-shadow-[0_0_16px_rgba(94,196,160,0.35)]">
                    Mới Cập Nhật
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(94,196,160,0.35)] to-transparent" />
            </div>

            {/* THÔNG BÁO CHẾ ĐỘ OFFLINE */}
            {dataState.isOffline && (
                <div className='flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 text-amber-400 p-3 rounded-xl justify-center text-xs font-semibold tracking-wide shadow-lg shadow-amber-500/5 animate-pulse'>
                    <ExclamationCircleOutlined className="text-sm" />
                    <span>Hệ thống tự động kích hoạt chế độ ngoại tuyến (Offline Mode) do máy chủ đang bảo trì.</span>
                </div>
            )}

            {/* KHUNG XƯƠNG LOADING SKELETON: (Hệ lưới dọc tỷ lệ aspect-[2/3]) */}
            {dataState.loading && (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5'>
                    {[...Array(8)].map((_, idx) => (
                        <div key={`skeleton-movie-${idx}`} className='flex flex-col gap-3 animate-pulse'>
                            <div className='bg-[rgba(20,14,36,0.5)] border border-neutral-800/40 aspect-[2/3] rounded-xl w-full'></div>
                            <div className='px-1 space-y-2'>
                                <div className='h-3.5 bg-neutral-800 rounded w-11/12'></div>
                                <div className="h-2.5 bg-neutral-800/50 rounded-md w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* HIỂN THỊ LƯỚI PHIM THẬT: HIỆU ỨNG SCALE Poster */}
            {!dataState.loading && Array.isArray(moviesList) && moviesList.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5'>
                    {moviesList.map((movie, index) => {
                        const isFirstRow = index < 4;

                        // Chuẩn hóa chuỗi trạng thái phim bộ / phim lẻ
                        const statusText = typeof movie?.status === 'object'
                            ? (movie.status.displayName || movie.status.code || 'Đang Chiếu')
                            : (movie?.status || 'Đang Chiếu');

                        return (
                            <div
                                key={movie?.id || index}
                                onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                                className='group flex flex-col gap-3 cursor-pointer select-none'
                            >
                                {/* KHU VỰC IMAGE POSTER: GIỮ ASPECT-[2/3] CŨ CỦA BẠN (Đã bỏ -translate-y-1.5 và icon Play) */}
                                <div className='relative aspect-[2/3] w-full overflow-hidden bg-[#0c0818] rounded-xl shadow-lg border border-[rgba(232,200,114,0.12)] transition-all duration-300 ease-out group-hover:scale-[1.01] group-hover:shadow-[0_0_20px_rgba(94,196,160,0.2)] group-hover:border-[#5ec4a0]/50'>

                                    {/* TAG SỐ TẬP: Màu Ngọc Bích mờ viền nhung cao cấp chuẩn Halim */}
                                    {movie?.latestEpisode !== undefined && (
                                        <div className='absolute top-2 left-2 z-20 overflow-hidden rounded-md shadow-md shadow-black/60 border border-[#5ec4a0]/30'>
                                            <div className='bg-[#182823] px-2.5 py-1 transition-all duration-300'>
                                                <span className='text-[10px] text-[#5ec4a0] font-black tracking-wide font-sans block whitespace-nowrap drop-shadow-md'>
                                                    Tập {movie.latestEpisode}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* HÌNH ẢNH POSTER PHIM (Giữ lại hoạt ảnh scale phóng to ảnh nhẹ nhàng khi hover) */}
                                    <img
                                        src={movie?.thumbnailUrl || movie?.posterUrl || 'https://placehold.co'}
                                        alt={movie?.title || 'Movie'}
                                        loading={isFirstRow ? "eager" : "lazy"}
                                        fetchPriority={isFirstRow ? "high" : "low"}
                                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                                    />

                                    {/* BADGE TRẠNG THÁI Ở CHÂN ẢNH */}
                                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0c0818] via-[#0c0818]/60 to-transparent pt-8 pb-2.5 px-2.5 text-left'>
                                        <span className="text-[9px] text-[#5ec4a0] font-black tracking-widest uppercase block truncate font-sans drop-shadow-sm">
                                            {statusText}
                                        </span>
                                    </div>

                                    {/* LỚP PHỦ HOVER KÍNH MỜ (Đã gỡ bỏ hoàn toàn icon Play, chỉ làm mờ nhẹ hậu cảnh) */}
                                    <div className='absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[0.5px]' />
                                </div>

                                {/* KHU VỰC THÔNG TIN TIÊU ĐỀ */}
                                <div className='px-1 flex flex-col gap-0.5 min-h-[48px] justify-center'>
                                    {/* Tiêu đề chính chuyển màu xanh Ngọc Bích khi hover */}
                                    <h3 className="font-bold text-xs sm:text-[13px] text-[#f0e4c8] group-hover:text-[#5ec4a0] transition-colors duration-250 truncate" title={movie?.title || ''}>
                                        {movie?.title || 'Chưa có tên'}
                                    </h3>

                                    {/* Tên phụ/Tên tiếng Anh gốc */}
                                    <span className="text-[10px] text-[#c4b896] opacity-75 truncate capitalize font-medium font-sans">
                                        {movie?.subTitle || movie?.originalTitle || 'Đang cập nhật tên...'}
                                    </span>

                                    {/* METADATA: Lịch phim & Lượt xem */}
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 pt-1 border-t border-neutral-900 font-sans">
                                        <span className="truncate max-w-[110px] flex items-center gap-1 font-medium text-neutral-400">
                                            <ScheduleOutlined className="text-[#5ec4a0] text-[11px]" />
                                            <span className="truncate">{movie?.schedule || 'Hàng tuần'}</span>
                                        </span>
                                        <span className='shrink-0 flex items-center gap-1 text-neutral-500'>
                                            <EyeOutlined className="text-neutral-600 text-[11px]" />
                                            {movie?.viewsTotal ? Number(movie.viewsTotal).toLocaleString('vi-VN') : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* THANH PHÂN TRANG */}
            {!dataState.loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-neutral-900 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#13161f] text-gray-400 border border-white/5 hover:text-[#5ec4a0] hover:border-[#5ec4a0]/40 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                    >
                        <LeftOutlined />
                    </button>

                    <span className="text-gray-400 font-medium tracking-wide">
                        Trang <strong className="bg-emerald-500/10 text-[#5ec4a0] px-2 py-0.5 rounded-md border border-[#5ec4a0]/20 font-bold mx-1">{currentPage + 1}</strong> / {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#13161f] text-gray-400 border border-white/5 hover:text-[#5ec4a0] hover:border-[#5ec4a0]/40 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                    >
                        <RightOutlined />
                    </button>
                </div>
            )}
        </div>
    );
};

export default memo(ListMovie);
