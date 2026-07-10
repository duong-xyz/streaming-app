// ==================== BẮT ĐẦU PHẦN 1/3 ====================
import React, { useEffect, useState } from 'react';
import { CalendarOutlined, ClockCircleOutlined, ThunderboltOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import movieService from '../services/movieService';
import { useNavigate } from 'react-router-dom'

const DAYS_OF_WEEK = [
    { key: 'SUN', label: 'Chủ Nhật' },
    { key: 'MON', label: 'Thứ Hai' },
    { key: 'TUE', label: 'Thứ Ba' },
    { key: 'WED', label: 'Thứ Tư' },
    { key: 'THU', label: 'Thứ Năm' },
    { key: 'FRI', label: 'Thứ Sáu' },
    { key: 'SAT', label: 'Thứ Bảy' },
];

const SchedulePage = () => {
    const [currentDay, setCurrentDay] = useState(() => {
        const currentDayIndex = new Date().getDay(); // 0: Chủ Nhật, 1: Thứ 2..., 6: Thứ 7
        return DAYS_OF_WEEK[currentDayIndex].key;
    });
    const [currentPage, setCurrentPage] = useState(0);    // Phân trang Spring Boot bắt đầu tính từ trang 0
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            try {
                const result = await movieService.getMovieSchedule(currentDay, currentPage, 12);
                setScheduleData(result);
            } catch (error) {
                console.error('Lỗi tải lịch phát sóng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [currentDay, currentPage]);

    const handleDayChange = (dayKey) => {
        setCurrentDay(dayKey);
        setCurrentPage(0); // Đổi Thứ thì ép trang phân trang về 0 ban đầu
    };

    const todayList = scheduleData?.moviesShowingToday?.content || [];
    const earlyList = scheduleData?.moviesShowingEarly?.content || [];
    const todayPageInfo = scheduleData?.moviesShowingToday?.page || { totalPages: 0 };
    const earlyPageInfo = scheduleData?.moviesShowingEarly?.page || { totalPages: 0 };
    const maxTotalPages = Math.max(todayPageInfo.totalPages, earlyPageInfo.totalPages);

    return (
        <div
            className="mx-auto my-5 mb-12 relative max-w-[1350px] py-7 pb-10 overflow-hidden select-none bg-fixed bg-center bg-cover"
            style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                backgroundImage: `url('https://hoathinh3d.st/wp-content/themes/halimmovies-child/assets/image/bg-lc-dt.webp')`
            }}
        >
            {/* LỚP LỌC OVERLAY PHỦ MỜ KHÔNG GIAN (Đúng mã màu mờ ảo gốc) */}
            <div
                className="absolute inset-0 z-1 pointer-events-none backdrop-blur-[3px]"
                style={{
                    background: 'linear-gradient(180deg, rgba(8,5,18,.55) 0%, rgba(12,8,24,.72) 35%, rgba(10,6,20,.78) 70%, rgba(6,4,14,.85) 100%)'
                }}
            />
            {/* Hiệu ứng Radial dải phát quang xanh ngọc bích ở đỉnh trang gốc (:after) */}
            <div
                className="absolute inset-0 z-1 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(94,196,160,.06), transparent 60%)'
                }}
            />

            <div className="relative z-2 px-[18px]">

                {/* 1. KHỐI TIÊU ĐỀ CHÍNH GIỮA (Có icon ◆ phát quang hai đầu đối xứng) */}
                <div className="text-center mb-8 animate-[lc-fade-up_0.5s_ease]">
                    <div className="w-16 h-[2px] mx-auto mb-4 opacity-75 rounded-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #e8c872, transparent)' }} />

                    <div className="inline-flex items-center gap-3.5 relative px-9 py-3.5 text-lg sm:text-xl font-bold tracking-[3px] text-[#f0e4c8] bg-gradient-to-br from-[rgba(30,22,48,0.9)] to-[rgba(18,12,32,0.95)] border border-[rgba(232,200,114,0.22)] rounded-[4px] shadow-[0_0_24px_rgba(232,200,114,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] text-[#e8c872] opacity-60 animate-[lc-shimmer_3s_ease_infinite]">◆</span>
                        <CalendarOutlined className="text-[0.85em] text-[#e8c872] drop-shadow-[0_0_6px_rgba(232,200,114,0.5)]" />
                        <h1 className="m-0 text-inherit uppercase inline-block text-sm font-bold tracking-[2px]">Lịch Chiếu XYZ</h1>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-[#e8c872] opacity-60 animate-[lc-shimmer_3s_ease_infinite]">◆</span>
                    </div>

                    <p className="mt-3 text-xs tracking-[1px] text-[#c4b896] opacity-85">
                        Xem lịch chiếu phim hoạt hình trung quốc đang chiếu trong tuần.
                    </p>
                </div>
                {/* 2. THANH TAB CHỌN THỨ TRONG TUẦN (Màu nền mờ xám mực gốc) */}
                <div className="flex justify-center flex-wrap gap-2 mb-6 p-4 px-5 bg-[rgba(14,10,28,0.82)] border border-[rgba(232,200,114,0.22)] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {DAYS_OF_WEEK.map((day) => {
                        const isActive = currentDay === day.key;
                        return (
                            <button
                                key={day.key}
                                type="button"
                                onClick={() => handleDayChange(day.key)}
                                className={`flex-0 shrink-0 min-w-[88px] px-3.5 py-2.5 text-center cursor-pointer text-xs font-semibold tracking-[0.3px] rounded-md transition-all duration-200 border outline-none
                  ${isActive
                                        ? 'text-[#0c0818] font-bold bg-gradient-to-b from-[#e8c872] to-[#b8943f] border-[#e8c872] shadow-[0_0_24px_rgba(232,200,114,0.25)]'
                                        : 'text-[#c4b896] bg-[rgba(0,0,0,0.25)] border-[rgba(232,200,114,0.12)] hover:text-[#f0e4c8] hover:border-[rgba(94,196,160,0.35)] hover:bg-[rgba(94,196,160,0.08)]'
                                    }`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                </div>

                {/* 3. KHỐI HIỂN THỊ DỮ LIỆU CHÍNH */}
                {loading && !scheduleData ? (
                    <div className="space-y-6">
                        <div className="p-[22px_24px] bg-[rgba(14,10,28,0.82)] border border-[rgba(232,200,114,0.2)] rounded-xl">
                            <div className="h-4 w-28 bg-neutral-800 rounded animate-pulse mb-4"></div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
                                <div className="h-28 rounded-lg bg-[rgba(20,14,36,0.5)] animate-pulse"></div>
                                <div className="h-28 rounded-lg bg-[rgba(20,14,36,0.5)] animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`space-y-6 transition-all duration-300 ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>

                        {/* PHÂN HỆ: PHIM CHIẾU SỚM (TONE VÀNG GOLD - SHADOW GLOW GOLD CHUẨN ĐẶC TẢ) */}
                        {earlyList.length > 0 && (
                            <div className="p-[22px_24px] bg-[rgba(14,10,28,0.82)] border border-[rgba(232,200,114,0.2)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] relative before:content-[''] before:absolute before:top-0 before:left-6 before:right-6 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#e8c872] before:to-transparent before:opacity-50 animate-[lc-fade-up_0.35s_ease]">
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[rgba(232,200,114,0.15)]">
                                    <ThunderboltOutlined className="!text-[17px] !text-[#e8c872] drop-shadow-[0_0_6px_rgba(232,200,114,0.4)]" />
                                    <span className="text-sm font-bold tracking-[2px] uppercase text-[#e8c872] drop-shadow-[0_0_16px_rgba(232,200,114,0.3)]">Phim Chiếu Sớm</span>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(232,200,114,0.35)] to-transparent" />
                                </div>

                                <div className="grid grid-cols-[repeat(2,minmax(300px,1fr))] gap-3.5">
                                    {earlyList.map((movie) => (
                                        <div
                                            key={movie.id}
                                            onClick={() => navigate(`/watch/${movie.id}`)}
                                            className="group flex gap-3.5 p-[14px_16px] bg-[rgba(20,14,36,0.88)] border border-[rgba(232,200,114,0.12)] rounded-lg text-[#f0e4c8] relative overflow-hidden transition-all duration-250 hover:border-[rgba(232,200,114,0.45)] hover:shadow-[0_0_24px_rgba(232,200,114,0.25)] hover:-translate-y-0.5"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#e8c872] to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100" />

                                            <div className="w-[64px] h-[90px] shrink-0 overflow-hidden rounded-md border border-[rgba(232,200,114,0.2)] shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-250 group-hover:border-[#e8c872] group-hover:shadow-[0_4px_16px_rgba(232,200,114,0.25)]">
                                                <img src={movie.thumbnailUrl || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <h4 className="m-0 mb-2 text-sm font-semibold leading-[1.45] text-[#f0e4c8] line-clamp-2 transition-colors duration-250 group-hover:text-[#e8c872]">
                                                    {movie.title}
                                                </h4>
                                                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.5px] text-[#e8c872] bg-amber-500/10 border border-amber-500/28 rounded-[20px] p-[3px_10px] w-max self-start">
                                                    <span className="text-[9px]">▶</span> Tập {movie.latestEpisode || 0}
                                                </div>
                                                <span className="mt-1.5 text-[10px] text-[#c4b896] opacity-90 flex items-center gap-1">
                                                    <span className="text-[#b8943f]">⏱</span> Cập nhật: {movie.updatedAtFormatted || 'Updating...'}
                                                </span>
                                            </div>

                                            <div className="absolute top-2.5 right-3.5 p-[3px_10px] text-[11px] font-bold tracking-[1px] text-[#e8c872] bg-[rgba(232,200,114,0.05)] rounded">
                                                {movie.schedule.split('|')[0] || 'Updating...'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* PHÂN HỆ: LỊCH CHIẾU HÔM NAY (TONE NGỌC BÍCH JADE - SHADOW GLOW JADE CHUẨN ĐẶC TẢ) */}
                        <div className="p-[22px_24px] bg-[rgba(14,10,28,0.82)] border border-[rgba(94,196,160,0.18)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] animate-[lc-fade-up_0.6s_ease_0.1s_both]">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[rgba(94,196,160,0.15)] text-[#5ec4a0]">
                                <CalendarOutlined className="text-[17px] text-[#5ec4a0] drop-shadow-[0_0_6px_rgba(94,196,160,0.4)]" />
                                <span className="text-sm font-bold tracking-[2px] uppercase text-[#5ec4a0] drop-shadow-[0_0_16px_rgba(94,196,160,0.35)]">Lịch Chiếu Hôm Nay</span>
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-[rgba(94,196,160,0.35)] to-transparent" />
                            </div>

                            {todayList.length === 0 && earlyList.length === 0 ? (
                                <div className="py-16 text-center text-xs text-neutral-500 font-medium">
                                    Hôm nay hệ thống chưa cập nhật lịch phát sóng phim mới.
                                </div>
                            ) : (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
                                    {todayList.map((movie) => (
                                        <div
                                            key={movie.id}
                                            className="group flex gap-3.5 p-[14px_16px] bg-[rgba(20,14,36,0.88)] border border-[rgba(232,200,114,0.12)] rounded-lg text-[#f0e4c8] relative overflow-hidden transition-all duration-250 hover:border-[rgba(94,196,160,0.45)] hover:shadow-[0_0_20px_rgba(94,196,160,0.2)] hover:-translate-y-0.5"
                                        >
                                            {/* Vạch chỉ màu ngọc bích chạy dọc mép trái khi hover */}
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#5ec4a0] to-transparent opacity-0 transition-opacity duration-250 group-hover:opacity-100" />

                                            {/* Ô chứa ảnh đúng kích thước cố định 64x90px */}
                                            <div className="w-[64px] h-[90px] shrink-0 overflow-hidden rounded-md border border-[rgba(232,200,114,0.2)] shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-250 group-hover:border-[#5ec4a0] group-hover:shadow-[0_4px_16px_rgba(94,196,160,0.25)]">
                                                <img src={movie.thumbnailUrl || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <h4 className="m-0 mb-2 text-sm font-semibold leading-[1.45] text-[#f0e4c8] line-clamp-2 transition-colors duration-250 group-hover:text-[#5ec4a0]">
                                                    {movie.title}
                                                </h4>
                                                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.5px] text-[#5ec4a0] bg-emerald-500/10 border border-emerald-500/28 rounded-[20px] p-[3px_10px] w-max self-start">
                                                    <span className="text-[9px]">▶</span> Tập {movie.latestEpisode || 0}
                                                </div>
                                                <span className="mt-1.5 text-[10px] text-[#c4b896] opacity-90 flex items-center gap-1">
                                                    <span className="text-[#2d7a62]">🟢</span> Cập nhật: {movie.updatedAtFormatted || '3 giờ trước'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* THANH ĐIỀU KHIỂN PHÂN TRANG COMPATIBLE VIA_DTO */}
                        {maxTotalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-4 select-none">
                                <button type="button" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-[rgba(14,10,28,0.82)] text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white disabled:pointer-events-none disabled:opacity-20"><LeftOutlined /></button>
                                <span className="text-[11px] font-bold text-neutral-500 tracking-wide">Trang <strong className="text-neutral-300">{currentPage + 1}</strong> / {maxTotalPages}</span>
                                <button type="button" disabled={currentPage >= maxTotalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-[rgba(14,10,28,0.82)] text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white disabled:pointer-events-none disabled:opacity-20"><RightOutlined /></button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
// ==================== KẾT THÚC PHẦN 3/3 ====================
