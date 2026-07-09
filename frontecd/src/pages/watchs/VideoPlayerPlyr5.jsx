import React, { memo, useRef, useEffect, useState } from 'react';
import { LeftOutlined, MonitorOutlined, LoadingOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Plyr } from 'plyr-react';
import Hls from 'hls.js';
import PlayerAbsoluteSidebar from './VpEpSidebar'; // Đường dẫn đến sidebar trượt của bạn

const VideoPlayerArea = ({
    loadingVideo,
    activeEpisodeNumber, // Số tập (dùng hiển thị text giao diện)
    qualities,
    activeQuality,
    onQualityChange,
    episodes = [],       // Nhận mảng object [{id, episodeNumber}, ...] từ Watch.jsx
    onEpisodeChange      // Hàm chuyển tập phim từ Watch.jsx
}) => {
    const hlsRef = useRef(null);
    const videoElementRef = useRef(null);
    const plyrInstanceRef = useRef(null); 
    const lastSavedTimeRef = useRef(0);
    const isReadyRef = useRef(false);

    const [showSidebar, setShowSidebar] = useState(false);

    // Tìm chính xác Object tập phim hiện tại từ mảng trùng khớp với số tập đang phát
    const currentEpisodeObj = episodes.find(ep => Number(ep.episodeNumber) === Number(activeEpisodeNumber));
    
    // ĐỒNG BỘ VÀNG: Sử dụng ID tập phim thực tế làm khóa lưu trữ giống hệt danh sách nút bấm của bạn
    const currentEpisodeId = currentEpisodeObj?.id || 'default';

    const streamUrl = activeQuality?.m3u8Url || (typeof activeQuality === 'string' ? activeQuality : null);
    const storageKey = `playback_time_ep_${currentEpisodeId}`; // Khóa localStorage lưu theo ID tập phim

    // Hàm lõi nạp luồng phát HLS m3u8 cấp độ cao (Expert Core)
    const loadHlsStream = (videoElement, url) => {
        if (!videoElement || !url) return;

        if (hlsRef.current) {
            try {
                hlsRef.current.detachMedia();
                hlsRef.current.destroy();
            } catch (e) {
                console.error("Lỗi giải phóng luồng cũ:", e);
            }
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 15,          
                maxMaxBufferLength: 30,       
                maxBufferSize: 40 * 1024 * 1024, 
                maxBufferHole: 0.5,           
                backBufferLength: 5,          
                enableWorker: true,
                lowLatencyMode: false,
                progressive: true,
                nudgeMaxRetry: 8,             
                nudgePercent: 0.1,            
                appendErrorMaxRetry: 5,
                manifestLoadingTimeOut: 6000,
                levelLoadingTimeOut: 6000,
                fragLoadingTimeOut: 6000,     
                manifestLoadingMaxRetry: 4,
                levelLoadingMaxRetry: 4,
                fragLoadingMaxRetry: 4,
            });

            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            // Ép khôi phục thời gian xem cũ ngay khi luồng m3u8 vừa khớp nối phần cứng
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                const savedTime = localStorage.getItem(storageKey);
                if (savedTime && videoElement) {
                    const parsedTime = parseFloat(savedTime);
                    
                    const forceSeek = () => {
                        if (plyrInstanceRef.current && isReadyRef.current) {
                            plyrInstanceRef.current.currentTime = parsedTime; 
                        } else {
                            videoElement.currentTime = parsedTime; 
                        }
                    };

                    forceSeek();
                    setTimeout(forceSeek, 300); // Khoảng trễ an toàn chặn đứng trình duyệt override mốc thời gian
                    setTimeout(forceSeek, 800); 
                }
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            break;
                    }
                }
            });
        }
        else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = url;
            
            const nativeSafariSeek = () => {
                const savedTime = localStorage.getItem(storageKey);
                if (savedTime) videoElement.currentTime = parseFloat(savedTime);
            };
            videoElement.addEventListener('loadedmetadata', nativeSafariSeek, { once: true });
        }
    };
    // ==========================================================================
    // KHỔI TẠO ĐỒNG BỘ: LIÊN KẾT THẺ VIDEO LÕI LẦN ĐẦU TIÊN KHI PLYR READY
    // ==========================================================================
    const handlePlyrRef = (plyrComponent) => {
        const plyrInstance = plyrComponent?.plyr || plyrComponent?.instance;
        const nativeVideo = plyrInstance?.media;

        if (!nativeVideo) return;
        
        plyrInstanceRef.current = plyrInstance;
        videoElementRef.current = nativeVideo;

        // Cơ chế bẫy lưu trữ mốc thời gian xem phim (Throttle 2 giây)
        const handleTimeUpdate = () => {
            if (!isReadyRef.current) return;
            const currentTime = nativeVideo.currentTime;
            const duration = nativeVideo.duration;

            if (Math.abs(currentTime - lastSavedTimeRef.current) >= 2) {
                if (duration && duration - currentTime < 10) {
                    localStorage.removeItem(storageKey); // Xem hết phim -> Xóa lịch sử tập này
                } else if (currentTime > 2) {
                    localStorage.setItem(storageKey, currentTime.toString()); // Ghi mốc thời gian mới
                }
                lastSavedTimeRef.current = currentTime;
            }
        };

        // Gắn sự kiện lắng nghe trực tiếp trên lõi video
        nativeVideo.removeEventListener('timeupdate', handleTimeUpdate);
        nativeVideo.addEventListener('timeupdate', handleTimeUpdate);

        // Đợi Plyr Ready hoàn toàn để mở khóa điều khiển phần cứng nâng cao
        plyrInstance.on('ready', () => {
            isReadyRef.current = true;
            console.log("Trình phát Plyr đã sẵn sàng hoạt động.");
            const savedTime = localStorage.getItem(storageKey);
            if (savedTime) {
                plyrInstance.currentTime = parseFloat(savedTime);
            }
        });

        // Nạp luồng m3u8 ngay lập tức cho lần đầu tiên vừa mount DOM
        if (streamUrl && !hlsRef.current) {
            loadHlsStream(nativeVideo, streamUrl);
        }
    };

    // ==========================================================================
    // THEO DÕI BIẾN ĐỘNG AN TOÀN: ĐỔI STREAM MƯỢT MÀ CHỐNG SẬP REMOVECHILD VÀ ĐEN HÌNH
    // ==========================================================================
    useEffect(() => {
        if (videoElementRef.current && streamUrl) {
            console.log(`Chuyển luồng phát sang Tập ID: ${currentEpisodeId} | Link: ${streamUrl}`);
            
            lastSavedTimeRef.current = 0; // Đổi tập -> Reset bộ đếm mốc thời gian tạm thời
            
            // Ép Plyr dừng dòng lệnh cũ để chuẩn bị nạp tài nguyên mới (Chống kẹt 00:00)
            if (plyrInstanceRef.current) {
                try {
                    plyrInstanceRef.current.stop();
                } catch (e) {
                    console.warn(e);
                }
            }

            // Thực hiện đổi luồng m3u8 trực tiếp trên thẻ video tĩnh
            loadHlsStream(videoElementRef.current, streamUrl);
        }
    }, [streamUrl, currentEpisodeId]); // Lắng nghe sự thay đổi của Link phát và ID tập phim

    // Giải phóng bộ nhớ giải mã phần cứng khi đóng tab / unmount component
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                hlsRef.current.detachMedia();
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (videoElementRef.current) {
                videoElementRef.current.src = '';
            }
            videoElementRef.current = null;
            plyrInstanceRef.current = null;
            isReadyRef.current = false;
        };
    }, []);

    const plyrOptions = {
        controls: [
            'play-large', 'rewind', 'play', 'fast-forward', 'progress',
            'current-time', 'duration', 'mute', 'volume',
            'settings', 'pip', 'fullscreen'
        ],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        seekTime: 10,
        keyboard: { focused: true, global: true }
    };

    return (
        <div className="col-span-1 order-1 flex flex-col gap-1">
            <style>{`
                .plyr--video { --plyr-color-main: #22d3ee; border-radius: 8px; }
                .CustomSidebarScroll::-webkit-scrollbar { width: 4px; }
                .CustomSidebarScroll::-webkit-scrollbar-track { bg: transparent; }
                .CustomSidebarScroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
                
                /* Tắt viền nét đứt màu xanh của thanh progress khi nhấn chuột */
                .plyr__progress input[type=range]:focus-visible,
                .plyr__progress input[type=range]:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
            `}</style>

            <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-900 aspect-video relative group plyr-dark-theme flex items-center justify-center">
                
                {/* NÚT BẤM MỞ SIDEBAR TRƯỢT GÓC PHẢI - CHỈ HIỆN KHI RÊ CHUỘT VÀO VIDEO */}
                <button
                    type="button"
                    onClick={() => setShowSidebar(true)}
                    className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/95 text-xs text-gray-200 px-3 py-1.5 rounded border border-zinc-800 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-lg backdrop-blur-sm"
                >
                    <MenuUnfoldOutlined />
                    <span>Danh sách tập</span>
                </button>

                {activeQuality && streamUrl ? (
                    <Plyr
                        key="plyr-expert-player" // SỬA ĐỔI CHÍNH XÁC: Đóng băng Key tĩnh cố định DOM để triệt tiêu lỗi removeChild
                        ref={handlePlyrRef}
                        source={{
                            type: 'video',
                            sources: [{ src: streamUrl, type: 'video/mp4' }]
                        }}
                        options={plyrOptions}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Đang chuẩn bị luồng phát phim...
                    </div>
                )}

                {/* SIDEBAR TUYỆT ĐỐI ĐÃ TÁCH BIỆT ĐƯỢC NHÚNG VÀO ĐÂY */}
                <PlayerAbsoluteSidebar
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    episodes={episodes}
                    activeEpisodeNumber={activeEpisodeNumber}
                    onEpisodeChange={onEpisodeChange}
                />

                {loadingVideo && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30 pointer-events-none gap-2">
                        <LoadingOutlined className="animate-spin text-3xl text-cyan-400" />
                        <span className="text-sm text-zinc-300 font-medium tracking-wide">Đang tải video...</span>
                    </div>
                )}
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

            {/* Bộ chọn chất lượng độ phân giải */}
            {qualities && qualities.length > 0 && (
                <div className="bg-[#1a1c23] border border-gray-800 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                        <MonitorOutlined /> Chất lượng:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {qualities.map((q) => {
                            const isCurrentQ = activeQuality?.id === q.id || activeQuality === q;
                            const qualityLabel = q.quality || "Bản Chuẩn";

                            return (
                                <button
                                    key={`quality-selector-${q.id || q}`}
                                    onClick={() => onQualityChange(q)}
                                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded border cursor-pointer transition-all ${isCurrentQ
                                        ? 'bg-[#222531] text-[#22d3ee] border-cyan-500/50 shadow-sm'
                                        : 'bg-[#222531] text-gray-400 border-gray-800 hover:border-cyan-500/40 hover:text-cyan-400'
                                        }`}
                                >
                                    {qualityLabel}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const MemoizedVideoPlayerArea = memo(VideoPlayerArea);
export default MemoizedVideoPlayerArea;
