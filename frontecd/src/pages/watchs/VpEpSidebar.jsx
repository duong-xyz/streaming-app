import React, { useEffect, useRef, memo } from 'react';
import { CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';

const PlayerAbsoluteSidebar = ({
    showSidebar,           
    setShowSidebar,        
    episodes = [],         
    activeEpisodeNumber,   
    onEpisodeChange        
}) => {
    const activeSidebarRef = useRef(null);

    // TỰ ĐỘNG SCROLL: Giữ nguyên logic scroll mượt mà
    useEffect(() => {
        if (showSidebar && activeSidebarRef.current) {
            activeSidebarRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [showSidebar, activeEpisodeNumber]);

    return (
        /* HỘP ĐỆM CÔ LẬP CỐ ĐỊNH */
        <div className="absolute top-0 right-0 h-full w-[280px] overflow-hidden pointer-events-none z-50">
            
            {/* Sử dụng inline style cho transform thay vì lạm dụng class Tailwind khi state thay đổi liên tục.
                Việc này giúp trình duyệt tối ưu việc vẽ (Repaint) cực tốt khi trượt kéo.
            */}
            <div 
                style={{ transform: showSidebar ? 'translateX(0)' : 'translateX(100%)' }}
                className="w-full h-full bg-[#111319] border-l border-zinc-900/60 flex flex-col text-zinc-300 transition-transform duration-200 ease-out will-change-transform pointer-events-auto"
            >
                {/* Header của Sidebar */}
                <div className="p-3 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40 select-none">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <UnorderedListOutlined /> CHỌN TẬP PHIM
                    </span>
                    <CloseOutlined
                        onClick={() => setShowSidebar(false)}
                        className="text-gray-400 hover:text-white cursor-pointer text-xs p-1 rounded hover:bg-zinc-800 transition-colors"
                    />
                </div>

                {/* Vùng cuộn danh sách */}
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:border-radius-[10px] [&::-webkit-scrollbar-thumb]:hover:bg-zinc-600">
                    {episodes.map((ep, index) => {
                        const epNumber = ep?.episodeNumber || ep;
                        const isCurrent = Number(activeEpisodeNumber) === Number(epNumber);

                        return (
                            <div
                                key={`player-sidebar-ep-${epNumber}`}
                                ref={isCurrent ? activeSidebarRef : null}
                                onClick={() => {
                                    if (!isCurrent) {
                                        onEpisodeChange(ep);
                                        setShowSidebar(false);
                                    }
                                }}
                                className={`w-full flex items-center justify-between p-2.5 rounded text-xs transition-all cursor-pointer ${
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
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- KỸ THUẬT EXPERT: CUSTOM MEMO COMPARISON FUNCTION ---
// Ép buộc React chỉ render lại Sidebar khi dữ liệu phim thực sự đổi. Mọi thay đổi về đóng/mở hay hàm callback bị re-create ở cha đều bị bỏ qua.
const areEqual = (prevProps, nextProps) => {
    return (
        prevProps.showSidebar === nextProps.showSidebar &&
        prevProps.activeEpisodeNumber === nextProps.activeEpisodeNumber &&
        prevProps.episodes.length === nextProps.episodes.length &&
        prevProps.episodes === nextProps.episodes
    );
};

export default memo(PlayerAbsoluteSidebar, areEqual);