import React, { useEffect, useState } from 'react';

const TABS_CONFIG = [
    { key: 'LATEST', label: 'Mới Cập Nhật' },
    { key: 'MON', label: 'Thứ Hai' },
    { key: 'TUE', label: 'Thứ Ba' },
    { key: 'WED', label: 'Thứ Tư' },
    { key: 'THU', label: 'Thứ Năm' },
    { key: 'FRI', label: 'Thứ Sáu' },
    { key: 'SAT', label: 'Thứ Bảy' },
    { key: 'SUN', label: 'Chủ Nhật' },
];

const HomeScheduleBar = ({ onTabChange }) => {
    // Tự động bóc tách và khóa chỉ mục thời gian thực ngoài đời của máy tính người xem
    const [realTimeDayKey, setRealTimeDayKey] = useState('');
    const [activeTab, setActiveTab] = useState('LATEST');

    useEffect(() => {
        // Ánh xạ chuẩn chỉ từ hàm Date().getDay() sang mã định danh hệ thống (0: CN, 1: Thứ 2...)
        const daysMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const currentDayIndex = new Date().getDay();
        setRealTimeDayKey(daysMap[currentDayIndex]);
    }, []);

    const handleTabClick = (key) => {
        setActiveTab(key);
        if (onTabChange) onTabChange(key); // Kích hoạt lệnh đẩy Thứ lên Component Home cha để lọc mảng bằng useMemo
    };

    return (
        <div className="w-full text-[#c2c8d0] select-none font-sans mt-[15px]">
            
            {/* LỚP BỌC SLIDER: Trên Mobile trượt ngang mượt mà (overflow-x-auto whitespace-nowrap), trên PC khóa cuộn rộng phẳng 100% */}
            <div className="flex w-full items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-2 pt-3.5 scroll-smooth style-scrollbar md:overflow-x-visible md:p-0 md:flex-nowrap">
                {TABS_CONFIG.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const isToday = realTimeDayKey === tab.key;
                    const isLatestButton = tab.key === 'LATEST';

                    return (
                        <div
                            key={tab.key}
                            className="relative flex-1 min-w-[95px] shrink-0 pt-3 md:shrink md:min-w-0"
                        >
                            {/* TAG "HÔM NAY" NHỎ MÀU XANH CYAN SÁNG (Ghim chuẩn xác vị trí top: -9px, chữ tối sẫm #04212b như CSS gốc) */}
                            {isToday && (
                                <span className="absolute top-[-2px] left-1/2 -translate-x-1/2 rounded-full bg-[#00bfff] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#04212b] shadow-[0_2px_6px_rgba(0,0,0,0.35)] z-20 select-none normal-case">
                                    Hôm nay
                                </span>
                            )}

                            {/* THÂN NÚT BẤM TAB VẬN DỤNG TOÀN BỘ MÃ MÀU VÀ ĐIỂM NGẮT MEDIA QUERY CỦA BẠN */}
                            <button
                                type="button"
                                onClick={() => handleTabClick(tab.key)}
                                className={`w-full cursor-pointer flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-center font-semibold leading-tight border transition-all duration-180 outline-none
                                    /* 1. Xử lý co giãn cỡ chữ Responsive co thắt theo mốc kích thước màn hình như đặc tả CSS của bạn */
                                    text-[13px] max-[767px]:text-[13px] [@media(min-width:768px)_and_(max-width:899px)]:text-[10.5px] [@media(min-width:768px)_and_(max-width:899px)]:px-0.5 [@media(min-width:900px)_and_(max-width:1100px)]:text-[12px] [@media(min-width:900px)_and_(max-width:1100px)]:px-1
                                    
                                    /* 2. Xử lý phân bổ nhánh màu dựa theo trạng thái tác vụ Active / Today / Mặc định */
                                    ${isActive
                                        ? isLatestButton
                                            ? 'bg-gradient-to-r from-[#0079a6] via-[#00a3d4] to-[#16c4ff] text-white border-transparent shadow-[0_4px_14px_rgba(0,170,224,0.35)] font-bold'
                                            : 'bg-gradient-to-r from-[#0079a6] via-[#00a3d4] to-[#16c4ff] text-white border-transparent shadow-[0_4px_14px_rgba(0,170,224,0.35)] font-bold'
                                        : isToday
                                            ? 'bg-[rgba(0,191,255,0.1)] border-[rgba(0,191,255,0.6)] text-[#7fe0ff] shadow-[inset_0_0_0_1px_rgba(0,191,255,0.25)] hover:bg-[#31353b] hover:border-[rgba(0,191,255,0.4)] hover:text-white hover:shadow-none hover:-translate-y-0.5'
                                            : 'bg-[#26292e] border-[rgba(255,255,255,0.08)] text-[#c2c8d0] hover:bg-[#31353b] hover:border-[rgba(0,191,255,0.4)] hover:text-white hover:-translate-y-0.5'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HomeScheduleBar;
