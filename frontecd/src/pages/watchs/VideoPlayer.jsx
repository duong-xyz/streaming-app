import React, { memo } from 'react'; 
import { Spin } from 'antd';
import { 
    LeftOutlined, 
    MonitorOutlined,
    BackwardOutlined, // Thêm icon tua lùi
    ForwardOutlined,  // Thêm icon tua tiến
    SoundOutlined     // Thêm icon âm lượng
} from '@ant-design/icons';

const VideoPlayerArea = ({ 
    videoRef, 
    loadingVideo, 
    activeEpisodeNumber, 
    qualities, 
    activeQuality, 
    onQualityChange
}) => {

    // 1. Hàm xử lý tua phim nội bộ (Tiến/Lùi X giây)
    const handleLocalSeek = (seconds) => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        let newTime = video.currentTime + seconds;

        // Giới hạn an toàn tránh tràn thời lượng video
        if (newTime < 0) newTime = 0;
        if (newTime > video.duration) newTime = video.duration;

        video.currentTime = newTime;
    };

    // 2. Hàm xử lý tăng/giảm âm lượng nội bộ (Tăng/Giảm X %)
    const handleLocalVolume = (step) => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        let newVolume = video.volume + step;

        // Giới hạn âm lượng luôn nằm trong khoảng từ 0.0 (tắt tiếng) đến 1.0 (max)
        if (newVolume < 0) newVolume = 0;
        if (newVolume > 1) newVolume = 1;

        video.volume = newVolume;
    };

    // 3. Hàm xử lý bật/tắt tiếng nhanh (Mute / Unmute)
    const handleLocalToggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
    };

    return (
        <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Khung phát phim - Thêm class "group" để quản lý hiệu ứng hover con */}
            <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-900 aspect-video relative group select-none">
                
                {/* Giữ nguyên thuộc tính controls mặc định nếu bạn vẫn muốn dùng thanh thời gian gốc */}
                <video ref={videoRef} controls className="w-full h-full object-contain" preload="auto" />
                
                {loadingVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 pointer-events-none">
                        <Spin size="large" tip="Đang tải video..." />
                    </div>
                )}

                {/* BỘ ĐIỀU KHIỂN TỰ CHẾ ĐÈ LÊN KHUNG VIDEO */}
                {/* Hiển thị mượt mà khi hover chuột: opacity-0 -> group-hover:opacity-100 */}
                <div className="absolute bottom-14 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-800/60 shadow-xl">
                    
                    {/* Nút tua lùi 10 giây */}
                    <button 
                        onClick={() => handleLocalSeek(-10)} 
                        className="text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors text-xs flex items-center gap-1 font-medium"
                        title="Lùi 10 giây"
                    >
                        <BackwardOutlined /> -10s
                    </button>

                    {/* Nút tua tiến 10 giây */}
                    <button 
                        onClick={() => handleLocalSeek(10)} 
                        className="text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors text-xs flex items-center gap-1 font-medium"
                        title="Tiến 10 giây"
                    >
                        +10s <ForwardOutlined />
                    </button>

                    {/* Vạch chia ngăn cách nhỏ */}
                    <div className="w-[1px] h-4 bg-gray-800" />

                    {/* Nút bật/tắt âm thanh nhanh */}
                    <button 
                        onClick={handleLocalToggleMute} 
                        className="text-gray-300 hover:text-cyan-400 cursor-pointer transition-colors text-sm"
                        title="Bật/Tắt tiếng"
                    >
                        <SoundOutlined />
                    </button>

                    {/* Cặp nút tăng/giảm âm lượng */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-300">
                        <button 
                            onClick={() => handleLocalVolume(-0.1)}
                            className="bg-[#222531] border border-gray-800 px-2 py-0.5 rounded hover:border-cyan-500/40 hover:text-cyan-400 active:bg-cyan-500/20 cursor-pointer transition-all"
                            title="Giảm âm lượng"
                        >
                            -
                        </button>
                        <span className="text-[10px] text-gray-500 font-normal px-0.5">Vol</span>
                        <button 
                            onClick={() => handleLocalVolume(0.1)}
                            className="bg-[#222531] border border-gray-800 px-2 py-0.5 rounded hover:border-cyan-500/40 hover:text-cyan-400 active:bg-cyan-500/20 cursor-pointer transition-all"
                            title="Tăng âm lượng"
                        >
                            +
                        </button>
                    </div>

                </div>
            </div>

            {/* Thanh điều khiển phụ */}
            <div className="flex justify-between items-center bg-[#1a1c23] border border-gray-800 p-3 rounded-lg text-xs text-gray-400">
                <span className="hover:text-cyan-400 cursor-pointer flex items-center gap-1">
                    <LeftOutlined size={10} /> Mở rộng màn hình
                </span>
                {activeEpisodeNumber && (
                    <span className="text-cyan-400 font-semibold">Bạn đang xem Tập {activeEpisodeNumber}</span>
                )}
                <span className="hover:text-cyan-400 cursor-pointer">Tập Trước</span>
            </div>

            {/* Bộ chọn chất lượng m3u8 */}
            {qualities.length > 0 && (
                <div className="bg-[#1a1c23] border border-gray-800 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                        <MonitorOutlined /> Lựa chọn tốc độ và chất lượng nguồn phát:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {qualities.map((q) => {
                            const isCurrentQ = activeQuality?.id === q.id;
                            return (
                                <button
                                    key={`quality-selector-${q.id}`}
                                    onClick={() => onQualityChange(q)}
                                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded border cursor-pointer transition-all ${
                                        isCurrentQ
                                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                                            : 'bg-[#222531] text-gray-400 border-gray-800 hover:border-emerald-500/40 hover:text-emerald-400'
                                    }`}
                                >
                                    {q.quality}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(VideoPlayerArea);
