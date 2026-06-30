import React, { memo } from 'react'; 
import { Spin } from 'antd';
import { LeftOutlined, MonitorOutlined } from '@ant-design/icons';

const VideoPlayerArea = ({ 
    videoRef, 
    loadingVideo, 
    activeEpisodeNumber, 
    qualities, 
    activeQuality, 
    onQualityChange
}) => {
    return (
        <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Khung phát phim */}
            <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-900 aspect-video relative group">
                
                {/* DÙNG TRÌNH ĐIỀU KHIỂN CÓ SẴN BẰNG THUỘC TÍNH controls */}
                <video 
                    ref={videoRef} 
                    controls 
                    className="w-full h-full object-contain" 
                    preload="auto" 
                />
                
                {loadingVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 pointer-events-none">
                        <Spin size="large" tip="Đang tải video..." />
                    </div>
                )}
            </div>

            {/* Thanh điều khiển phụ dưới khung phim */}
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
