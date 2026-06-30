import { forwardRef, memo } from "react";
import {
    ExclamationCircleOutlined, PlayCircleOutlined, ScheduleOutlined,
    EyeOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons'

const ListMovie = ({ setActiveFilter, activeFilter, dataState, navigate, handlePageChange, currentPage }) => {
    const moviesList = Array.isArray(dataState?.movies) ? dataState.movies : [];
    const totalPages = dataState?.totalPages || 1;

    return (
        <div className='lg:col-span-3 space-y-5 select-none'>
            {/* THANH ĐIỀU HƯỚNG BỘ LỌC (FILTER BAR TÌNH TẾ) */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-900 pb-3 gap-3'>
                <div className='flex items-center gap-2'>
                    <span className='w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full' />
                    <h2 className='text-sm md:text-base font-black text-gray-100 uppercase tracking-wider font-sans'>
                        Mới Cập Nhật
                    </h2>
                </div>

                {/* Tab bộ lọc tinh chỉnh bo tròn mịn */}
                <div className='flex gap-2 overflow-x-auto scrollbar-none py-0.5 text-[11px] font-sans'>
                    {['3D', '2D', '4K', 'Lịch phim'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1 rounded-full font-bold tracking-wide transition-all duration-300 border whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_2px_10px_rgba(34,211,238,0.3)]'
                                    : 'bg-[#13161f] text-gray-400 border-white/5 hover:text-cyan-400 hover:border-cyan-500/30'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* THÔNG BÁO CHẾ ĐỘ OFFLINE */}
            {dataState.isOffline && (
                <div className='flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 text-amber-400 p-3 rounded-xl justify-center text-xs font-semibold tracking-wide shadow-lg shadow-amber-500/5 animate-pulse'>
                    <ExclamationCircleOutlined className="text-sm" />
                    <span>Hệ thống tự động kích hoạt chế độ ngoại tuyến (Offline Mode) do máy chủ đang bảo trì.</span>
                </div>
            )}

            {/* KHUNG XƯƠNG LOADING SKELETON (Khóa layout chuẩn kích thước chống nhảy trang CLS) */}
            {dataState.loading && (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5'>
                    {[...Array(8)].map((_, idx) => (
                        <div key={`skeleton-movie-${idx}`} className='flex flex-col gap-3 animate-pulse'>
                            <div className='bg-slate-900/60 aspect-[2/3] rounded-xl w-full border border-white/5'></div>
                            <div className='px-1 space-y-2'>
                                <div className='h-3.5 bg-slate-900/80 rounded-md w-11/12'></div>
                                <div className="h-2.5 bg-slate-900/40 rounded-md w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* HIỂN THỊ LƯỚI PHIM THẬT KHI ĐÃ TẢI XONG (LOADING = FALSE) */}
            {!dataState.loading && Array.isArray(moviesList) && moviesList.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5'>
                    {moviesList.map((movie, index) => {
                        // Tối ưu LCP: Hàng đầu tiên (4 items đầu) tải ngay lập tức, không dùng hiệu ứng trì hoãn lazy load
                        const isFirstRow = index < 4;

                        return (
                            <div
                                key={movie?.id || index}
                                onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                                className='group flex flex-col gap-3 cursor-pointer select-none'
                            >
                                {/* KHU VỰC IMAGE POSTER: Bo góc sâu và viền gương phản chiếu */}
                                <div className='relative aspect-[2/3] w-full overflow-hidden bg-[#0d0f14] rounded-xl shadow-lg border border-white/5 transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-hover:shadow-[0_8px_25px_rgba(34,211,238,0.15)] group-hover:border-cyan-500/30'>

                                    {/* TAG SỐ TẬP GÓC TRÁI: Hiệu ứng Gradient Đỏ-Cam-Vàng có chuyển động khi hover */}
                                    {movie?.latestEpisode !== undefined && (
                                        <div className='absolute top-2 left-2 z-20 overflow-hidden rounded-md shadow-md shadow-black/50 border border-white/10'>
                                            <div className='animate-gradient-hover bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 px-2 py-0.5 transition-all duration-500'>
                                                <span className='text-[10px] text-white font-extrabold tracking-wide font-sans block whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'>
                                                    Tập {movie.latestEpisode}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <img
                                        src={movie?.posterUrl || 'https://unsplash.com'}
                                        alt={movie?.title || 'Movie'}
                                        loading={isFirstRow ? "eager" : "lazy"}
                                        fetchpriority={isFirstRow ? "high" : "low"}
                                        className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
                                    />

                                    {/* BADGE TRẠNG THÁI / TẬP PHIM CHUYÊN NGHIỆP Ở CHÂN ẢNH */}
                                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-8 pb-2 px-2.5 text-left'>
                                        <span className="text-[9px] text-cyan-400 font-extrabold tracking-widest uppercase block truncate font-sans drop-shadow-md">
                                            {typeof movie?.status === 'object'
                                                ? (movie.status.displayName || movie.status.code || '4K CHẤT LƯỢNG CAO')
                                                : (movie?.status || '4K CHẤT LƯỢNG CAO')}
                                        </span>
                                    </div>

                                    {/* LỚP PHỦ HOVER PLAY VỚI HIỆU ỨNG GLOW */}
                                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]'>
                                        <div className='transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] text-4xl'>
                                            <PlayCircleOutlined />
                                        </div>
                                    </div>
                                </div>


                                {/* KHU VỰC THÔNG TIN TIÊU ĐỀ: Phân tầng chữ Việt - Anh gọn gàng */}
                                <div className='px-1 flex flex-col gap-0.5 min-h-[48px] justify-center'>
                                    <h3 className="font-bold text-xs sm:text-[13px] text-gray-200 group-hover:text-cyan-400 transition-colors duration-300 truncate" title={movie?.title || ''}>
                                        {movie?.title || 'Chưa có tên'}
                                    </h3>

                                    {/* Thêm tên phụ/tên gốc nhỏ ở dưới tạo chiều sâu bố cục */}
                                    <span className="text-[10px] text-gray-500 truncate capitalize font-medium font-sans">
                                        {movie?.subTitle || movie?.originalTitle || 'Updating name...'}
                                    </span>

                                    {/* METADATA: Lịch phim & Lượt xem */}
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 pt-1 border-t border-white/5 font-sans">
                                        <span className="truncate max-w-[110px] flex items-center gap-1">
                                            <ScheduleOutlined className="text-cyan-400 text-[11px]" />
                                            <span className="truncate">{movie?.schedule || 'Hàng tuần'}</span>
                                        </span>
                                        <span className='shrink-0 flex items-center gap-1'>
                                            <EyeOutlined className="text-gray-600" />
                                            {movie?.viewsTotal ? Number(movie.viewsTotal).toLocaleString() : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* THANH PHÂN TRANG (PAGINATION ĐẬM CHẤT ĐIỆN ẢNH) */}
            {!dataState.loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-900 text-xs font-sans">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#13161f] text-gray-400 border border-white/5 hover:text-cyan-400 hover:border-cyan-500/30 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                    >
                        <LeftOutlined />
                    </button>

                    <span className="text-gray-400 font-medium tracking-wide">
                        Trang <strong className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-400/20 font-bold mx-1">{currentPage + 1}</strong> / {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#13161f] text-gray-400 border border-white/5 hover:text-cyan-400 hover:border-cyan-500/30 disabled:opacity-10 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
                    >
                        <RightOutlined />
                    </button>
                </div>
            )}
        </div>
    );
}

export default memo(ListMovie);
