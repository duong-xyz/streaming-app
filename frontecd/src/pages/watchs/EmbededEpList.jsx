import React, { useEffect, useRef, memo } from 'react';
import { CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';

const PlayerAbsoluteSidebar = ({
    episodes = [],         
    activeEpisodeNumber,   
    onEpisodeChange        
}) => {
    const activeSidebarRef = useRef(null);

    // TỰ ĐỘNG SCROLL: Luôn chạy chuẩn xác khi đổi tập phim
    useEffect(() => {
        if (activeSidebarRef.current) {
            activeSidebarRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [activeEpisodeNumber]);

    return (
        /* 
          ĐÃ SỬA CLASS TẠI ĐÂY:
          - Đổi 'flex' mặc định thành 'hidden' để trình duyệt không tính toán không gian chiếm chỗ khi đang đóng (Xóa sổ vệt đen load đầu).
          - Bổ sung 'peer-checked:flex' để tái dựng lại cấu trúc hộp Flexbox ngay khi checkbox được tick mở.
          - className="absolute top-0 right-0 h-full w-[280px] bg-[#111319] z-50 border-l border-zinc-900/60 flex-col text-zinc-300 transition-all duration-300 transform translate-x-full opacity-0 pointer-events-none hidden peer-checked:flex peer-checked:translate-x-0 peer-checked:opacity-100 peer-checked:pointer-events-auto"
          */
        <div className="absolute top-0 right-0 h-full w-0 bg-[#111319]/94 z-50 flex flex-col text-zinc-300 transition-all duration-300 opacity-0 overflow-hidden pointer-events-none peer-checked:w-[280px] peer-checked:opacity-100 peer-checked:pointer-events-auto peer-checked:border-l peer-checked:border-zinc-900/60">
            
            {/* Header của Sidebar */}
            <div className="p-3 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900 select-none">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <UnorderedListOutlined /> CHỌN TẬP PHIM
                </span>
                
                {/* label HTML trỏ tới id checkbox ở cha để thực hiện đóng bằng CSS */}
                <label
                    htmlFor="sidebar-toggle"
                    className="text-gray-400 hover:text-white cursor-pointer text-xs p-1 rounded hover:bg-zinc-800 transition-colors flex items-center justify-center"
                >
                    <CloseOutlined />
                </label>
            </div>

            {/* Vùng cuộn danh sách */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:border-radius-[10px] [&::-webkit-scrollbar-thumb]:hover:bg-zinc-600">
                {episodes.map((ep) => {
                    const epNumber = ep?.episodeNumber || ep;
                    const isCurrent = Number(activeEpisodeNumber) === Number(epNumber);

                    return (
                        /* GIA CỐ: Thẻ bọc relative bảo vệ cấu trúc React */
                        <div key={`player-sidebar-ep-wrap-${epNumber}`} className="relative w-full">
                            
                            {/* KỸ THUẬT EXPERT: Thẻ label trong suốt nằm đè lên trên các tập phim CHƯA chọn.
                                Khi click, trình duyệt tự đóng sidebar bằng cơ chế input native mà không đụng chạm JavaScript. */}
                            {!isCurrent && (
                                <label
                                    htmlFor="sidebar-toggle"
                                    className="absolute inset-0 z-10 cursor-pointer"
                                    onClick={() => onEpisodeChange(ep)}
                                />
                            )}

                            {/* Giao diện nút tập phim (Xóa bỏ hoàn toàn sự kiện onClick và dòng JS cũ) */}
                            <div
                                ref={isCurrent ? activeSidebarRef : null}
                                className={`w-full flex items-center justify-between p-2.5 rounded text-xs transition-all ${
                                    isCurrent
                                        ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shadow-sm'
                                        : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }`}
                            >
                                <span>Tập {epNumber}</span>
                                {isCurrent && (
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(PlayerAbsoluteSidebar);
