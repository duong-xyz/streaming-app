import React, { useEffect, useRef, memo } from 'react';
import { CloseOutlined, UnorderedListOutlined } from '@ant-design/icons';

const PlayerAbsoluteSidebar = ({
    setShowSidebar,
    episodes = [],
    activeEpisodeNumber,
    onEpisodeChange
}) => {
    const activeSidebarRef = useRef(null);

    useEffect(() => {
        console.log('Sidebar render vì activeEpisodeNumber đổi:', activeEpisodeNumber);
    });

    // Đoạn code debug thần thánh để tìm thủ phạm đổi tham chiếu:
    const prevProps = useRef({});
    useEffect(() => {
        const changedProps = Object.entries({ setShowSidebar, episodes, activeEpisodeNumber, onEpisodeChange })
            .reduce((ps, [k, v]) => {
                if (prevProps.current[k] !== v) {
                    ps[k] = { from: prevProps.current[k], to: v };
                }
                return ps;
            }, {});
        if (Object.keys(changedProps).length > 0) {
            console.log('Prop làm sidebar bị re-render:', changedProps);
        }
        prevProps.current = { setShowSidebar, episodes, activeEpisodeNumber, onEpisodeChange };
    });

    // TỰ ĐỘNG SCROLL: Chỉ kích hoạt duy nhất khi chuyển tập phim (activeEpisodeNumber đổi)
    useEffect(() => {
        if (activeSidebarRef.current) {
            activeSidebarRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [activeEpisodeNumber]); // Loại bỏ hoàn toàn phụ thuộc vào showSidebar

    return (
        <div className="absolute top-0 right-0 h-full w-[280px] bg-[#111319] z-50 border-l border-zinc-900/60 flex flex-col text-zinc-300 pointer-events-auto ">
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
                {episodes.map((ep) => {
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
                            className={`w-full flex items-center justify-between p-2.5 rounded text-xs transition-all cursor-pointer ${isCurrent
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
    );
};

// Sử dụng React.memo chuẩn. Khi component cha đổi state đóng/mở, các props truyền vào đây 
// (setShowSidebar, episodes, activeEpisodeNumber, onEpisodeChange) không đổi -> Sidebar đứng im hoàn toàn.
export default memo(PlayerAbsoluteSidebar);
