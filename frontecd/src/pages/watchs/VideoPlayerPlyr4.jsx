import React, { memo, useRef, useEffect, useState, useMemo } from 'react';
import { LeftOutlined, MonitorOutlined, LoadingOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Plyr } from 'plyr-react';
import Hls from 'hls.js';
import PlayerAbsoluteSidebar from './SidebarListEp';
import PlayerAbsoluteSidebar2 from './EmbededEpList';
import { createRoot } from 'react-dom/client';


// Chuyển options cố định ra ngoài Component để tránh tạo lại reference, tối ưu bộ nhớ
const PLYR_OPTIONS = {
    controls: [
        'play-large', 'rewind', 'play', 'fast-forward', 'progress',
        'current-time', 'duration', 'mute', 'volume',
        'settings', 'pip', 'fullscreen',
    ],
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    seekTime: 10,
    keyboard: { focused: true, global: true },
    fullscreen: { iosNative: true, container: '.plyr-dark-theme' },
    playsinline: true
};

const VideoPlayerArea = ({
    loadingVideo,
    activeEpisodeNumber,
    qualities = [],
    activeQuality,
    onQualityChange,
    episodes = [],
    onEpisodeChange
}) => {
    const hlsRef = useRef(null);
    const videoElementRef = useRef(null);
    const lastSavedTimeRef = useRef(0);

    // CHỐT CHẶN AN TOÀN: Key lưu trữ
    const storageKey = `playback_time_ep_num_${activeEpisodeNumber || 'default'}`;

    // --- KỸ THUẬT EXPERT: Đóng gói biến & hàm động vào Ref để tránh lỗi Stale Closure tuyệt đối ---
    const updateProgressRef = useRef(null);
    updateProgressRef.current = (currentTime, duration) => {
        if (Math.abs(currentTime - lastSavedTimeRef.current) >= 2) {
            if (duration && duration - currentTime < 10) {
                localStorage.removeItem(storageKey); // Xem sắp xong -> Xoá
            } else if (currentTime > 2) {
                localStorage.setItem(storageKey, currentTime.toString()); // Lưu mốc mới
            }
            lastSavedTimeRef.current = currentTime;
        }
    };

    // Hàm listener tĩnh độc nhất, chuyển tiếp dữ liệu qua Ref ở trên
    const handleTimeUpdateStatic = (event) => {
        const video = event.target;
        if (!video) return;
        updateProgressRef.current?.(video.currentTime, video.duration);
    };

    // Hàm lõi nạp luồng phát HLS (Giữ nguyên tinh hoa cấu hình buffer của bạn)
    const loadHlsStream = (videoElement, url) => {
        if (!videoElement || !url) return;

        console.log("Kích hoạt nạp luồng phát HLS m3u8 thành công:", url);
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
        videoElement.playsInline = true;

        if (hlsRef.current) {
            hlsRef.current.detachMedia();
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Đảm bảo gỡ Listener cũ sạch sẽ trước khi gắn lại
        videoElement.removeEventListener('timeupdate', handleTimeUpdateStatic);

        if (Hls.isSupported()) {
            const hls = new Hls({
                // ==========================================
                // 🎯 THUẬT TOÁN ĐỆM ĐỘNG LŨY TIẾN (DYNAMIC BUFFERING)
                // ==========================================
                // Đẩy mạnh vùng đệm tải trước lên 90 giây. Khi người dùng xem yên tĩnh, 
                // trình duyệt sẽ kéo trước 1.5 phút phim vào RAM. Nếu họ tua ngắn (qua đoạn intro, tua 10s-30s),
                // phim sẽ CHẠY LẬP TỨC vì phân đoạn đó đã nằm sẵn trong máy, không mất 1 mili-giây tải từ Server.
                maxBufferLength: 60,          // Bộ đệm mục tiêu (Tăng từ 15s lên 60s)
                maxMaxBufferLength: 90,       // Bộ đệm tối đa cho phép tích lũy (Tăng từ 30s lên 90s)

                // Nâng giới hạn RAM đệm lên 96MB. Video HH3D thường có Bitrate rất cao và đồ họa đổ bóng nặng,
                // 96MB đảm bảo chứa trọn vẹn các phân đoạn 1080p/2K mà không bị trình duyệt xóa bỏ giữa chừng.
                maxBufferSize: 96 * 1024 * 1024,

                // Khóa bộ đệm ngược (Back Buffer): Giữ lại 15 giây phim đã xem trước đó trong RAM.
                // Nếu người dùng lỡ tay tua lùi lại vài giây để xem lại một cảnh chiến đấu, phim sẽ KHÔNG BỊ LOAD LẠI.
                backBufferLength: 15,

                // Khoảng hở bộ đệm tối đa. Nếu luồng stream bị mất một mảnh nhỏ dưới 0.5s, 
                // Hls.js sẽ tự động nhảy qua (skip) để phim chạy tiếp liên tục thay vì đứng im xoay vòng tròn.
                maxBufferHole: 0.5,

                // ==========================================
                // ⚡ TỐI ƯU HÓA TỐC ĐỘ TUA & GIẢI PHÓNG BĂNG THÔNG
                // ==========================================
                enableWorker: true,           // Chạy luồng xử lý mạng độc lập trên CPU để không gây khựng giao diện web
                lowLatencyMode: false,        // Tắt low-latency vì đây là phim VoD (Xem video theo yêu cầu), cần ưu tiên độ dày bộ đệm
                progressive: true,            // Bật cơ chế tải lũy tiến, đọc và xả dữ liệu ngay khi tải xong từng mẩu nhỏ của phân đoạn

                // CHIÊU THỨC KHÓA LUỒNG TẠI KHUNG HÌNH (Nudge Engine):
                // Khi tua trúng vùng bị lỗi hoặc lỗi đồng bộ âm thanh/hình ảnh, trình duyệt rất dễ bị đứng hình (stuck).
                // Hệ thống sẽ tự động "nhích" (nudge) nhẹ mốc thời gian 0.1 giây để ép card màn hình giải mã tiếp.
                nudgeMaxRetry: 10,
                nudgePercent: 0.1,

                // ==========================================
                // 🛡️ CHỐT CHẶN BẢO VỆ MẠNG YẾU (NETWORK FAULT TOLERANCE)
                // ==========================================
                // Tăng thời gian chờ phản hồi (Timeout) lên 10-15 giây để chống chịu khi Server CDN của bạn bị cá mập cắn cáp hoặc quá tải.
                manifestLoadingTimeOut: 10000,
                levelLoadingTimeOut: 10000,
                fragLoadingTimeOut: 15000,    // Ưu tiên thời gian tải phân đoạn phim (.ts)

                // Thuật toán tái kết nối thông minh (Exponential Retry): Nếu tải lỗi, hệ thống không sập ngay 
                // mà tự động thử lại nhiều lần với độ trễ tăng dần, giúp người dùng mạng 4G chập chờn không bị văng phim.
                manifestLoadingMaxRetry: 5,
                levelLoadingMaxRetry: 5,
                fragLoadingMaxRetry: 6,
                fragLoadingRetryDelay: 1000,  // Chờ 1 giây trước khi thử lại phân đoạn lỗi

                // ==========================================
                // 🚀 THUẬT TOÁN ƯỚC LƯỢNG BĂNG THÔNG EWMA NÂNG CAO
                // ==========================================
                // Đây là bí quyết giúp các web lớn tự động đổi chất lượng phim (Auto 360p -> 720p -> 1080p) cực mượt.
                // Hệ thống tính toán tốc độ mạng dựa trên trọng số thời gian thực, phản hồi ngay lập tức nếu mạng đột ngột bị tụt.
                abrEwmaFastLive: 1.5,
                abrEwmaSlowLive: 4.0,
                abrEwmaFastVoD: 2.5,          // Tốc độ bắt nhịp mạng nhanh khi xem phim
                abrEwmaSlowVoD: 5.0,          // Giữ độ ổn định đường truyền dài lâu
                abrBandwidthFactor: 0.85,     // Chỉ sử dụng 85% băng thông thực tế để tính toán chất lượng, chừa lại 15% làm đệm an toàn
                abrBandwidthUpRequestMaxScale: 1.5
            });


            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                videoElement.addEventListener('timeupdate', handleTimeUpdateStatic);

                // Khôi phục thời gian xem cũ (Auto Seek)
                const savedTime = localStorage.getItem(storageKey);
                if (savedTime) {
                    const parsedTime = parseFloat(savedTime);
                    const forceSeek = () => {
                        if (videoElementRef.current) videoElementRef.current.currentTime = parsedTime;
                    };
                    forceSeek();
                    setTimeout(forceSeek, 300);
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
        // else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        //     videoElement.src = url;
        //     videoElement.addEventListener('timeupdate', handleTimeUpdateStatic);

        //     const nativeSafariSeek = () => {
        //         const savedTime = localStorage.getItem(storageKey);
        //         if (savedTime) videoElement.currentTime = parseFloat(savedTime);
        //     };
        //     videoElement.addEventListener('loadedmetadata', nativeSafariSeek, { once: true });
        // }
        // KỸ THUẬT EXPERT: Bẻ khóa tốc độ tua phim cho iOS Safari Native
        else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Kích hoạt tải trước tối đa (Aggressive Preloading)
            videoElement.setAttribute('preload', 'auto');
            videoElement.preload = 'auto';
            // Ngắt cổ chai kết nối mạng (Hủy hoàn toàn các request phân đoạn .ts cũ đang treo khi người dùng tua liên tục)
            videoElement.src = '';
            videoElement.load();
            // Nạp luồng phát mới sạch sẽ vào nhân AVPlayer của Apple
            videoElement.src = url;
            // Đảm bảo dọn dẹp và đồng bộ Listener tĩnh bảo vệ bộ nhớ (Anti-Memory Leak)
            videoElement.removeEventListener('timeupdate', handleTimeUpdateStatic);
            videoElement.addEventListener('timeupdate', handleTimeUpdateStatic);

            // Auto Seek (Xem tiếp) bất đồng bộ, chống lỗi Safari bỏ qua lệnh tua do độ trễ CDN M3U8
            const nativeSafariSeek = () => {
                const savedTime = localStorage.getItem(storageKey);
                if (savedTime) {
                    const parsedTime = parseFloat(savedTime);
                    videoElement.currentTime = parsedTime;
                    // Chốt chặn dự phòng: Ép tua lại sau 200ms nếu lớp bảo mật iOS vô hiệu hóa lần tua đầu
                    const doubleCheckSeek = () => {
                        if (videoElement && Math.abs(videoElement.currentTime - parsedTime) > 1) {
                            videoElement.currentTime = parsedTime;
                        }
                    };
                    setTimeout(doubleCheckSeek, 200);
                }
            };

            // Lắng nghe metadata và chỉ chạy DUY NHẤT 1 lần để giải phóng RAM ({ once: true })
            videoElement.addEventListener('loadedmetadata', nativeSafariSeek, { once: true });
        }

    };

    // Effect 1: Theo dõi đổi chất lượng hoặc tập phim
    // 1. Chuyển đổi Object thành một chuỗi String URL duy nhất để React so sánh chính xác
    const currentStreamUrl = activeQuality?.m3u8Url || (typeof activeQuality === 'string' ? activeQuality : null);

    // 2. Chỉ kích hoạt nạp luồng khi chuỗi URL thực sự thay đổi (đổi tập hoặc đổi hẳn chất lượng)
    useEffect(() => {
        if (videoElementRef.current && currentStreamUrl) {
            console.log("Luồng phát thực sự thay đổi! Tiến hành nạp luồng...");
            lastSavedTimeRef.current = 0; // Reset mốc lưu tạm thời
            loadHlsStream(videoElementRef.current, currentStreamUrl);
        }
    }, [currentStreamUrl]); // <--- THAY ĐỔI TẠI ĐÂY: Chỉ theo dõi biến String currentStreamUrl

    // Effect 2: Dọn dẹp bộ nhớ tuyệt đối khi Unmount component
    useEffect(() => {
        return () => {
            if (videoElementRef.current) {
                videoElementRef.current.removeEventListener('timeupdate', handleTimeUpdateStatic);
            }
            if (hlsRef.current) {
                hlsRef.current.detachMedia();
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            videoElementRef.current = null;
        };
    }, []);

    // Callback Ref xử lý mượt mà khi Plyr tạo DOM thành công
    const plyrRefCallback = (node) => {
        if (node && node.plyr) {
            const nativeVideo = node.plyr.media;

            if (nativeVideo && videoElementRef.current !== nativeVideo) {
                videoElementRef.current = nativeVideo;
                if (currentStreamUrl) {
                    loadHlsStream(nativeVideo, currentStreamUrl);
                }
            }

            // CHỐT CHẶN AN TOÀN: Dùng dấu ?. để không bao giờ bị báo lỗi undefined khi component đang load
            const plyrControls = node.plyr.elements?.controls;
            // Tìm xem nút custom đã được tạo xung quanh vùng đó chưa (tránh trùng lặp khi re-render)
            const hasBtn = node.plyr.elements?.container?.querySelector('.plyr__custom-sidebar-btn');

            if (plyrControls && !hasBtn) {
                // 1. Tạo thẻ label bằng JS thuần
                const labelBtn = document.createElement('label');
                labelBtn.setAttribute('for', 'sidebar-toggle');
                labelBtn.className = 'plyr__custom-sidebar-btn'; // Loại bỏ bớt class mặc định '.plyr__control' của Plyr để tránh bị ăn đè style dẹt
                labelBtn.style.cursor = 'pointer';

                // 2. Nhét ruột Icon SVG + Chữ cho nút
                labelBtn.innerHTML = `
                <svg fill="currentColor" width="1rem" height="1rem" style="vertical-align: middle;" viewBox="-5 -7 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin"><path d='M4 0h9a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 8h9a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0-4h9a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zM1 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z' /></svg>
                <span style="margin-left: 5px; font-weight: 500;">Danh sách tập</span>
            `;

                // 3. CHIÊU THỨC QUYẾT ĐỊNH: Đặt nằm TRƯỚC lớp .plyr__controls (ngang cấp với controls)
                // Lúc này nút bấm sẽ nhảy lên nằm trực tiếp trong khối cha lớn .plyr
                //plyrControls.insertAdjacentElement('beforebegin', labelBtn);

                // Đặt nút nằm TRƯỚC lớp .plyr__controls (ngang cấp với controls)
                plyrControls.insertAdjacentElement('beforebegin', labelBtn);

                // 2. NHÚNG THÊM INPUT VÀ COMPONENT SIDEBAR (ĐÚNG Ý BẠN):
                // Tạo một hộp bọc thô bằng JS thuần nằm ngay sau nút để giữ quan hệ anh em CSS Peer (~)
                const sidebarWrapper = document.createElement('div');
                sidebarWrapper.className = 'plyr__custom-sidebar-wrapper';
                sidebarWrapper.style.display = 'contents'; // Đảm bảo hộp bọc này hoàn toàn trong suốt về mặt layout

                // Chèn hộp bọc này đứng ngay SAU nút Label vừa chèn ở trên
                labelBtn.insertAdjacentElement('afterend', sidebarWrapper);

                // Bung cổng React để render đồng thời cả Input lẫn Component con vào trong hộp bọc
                const root = createRoot(sidebarWrapper);
                root.render(
                    <>
                        <input
                            type="checkbox"
                            id="sidebar-toggle"
                            className="peer hidden"
                            defaultChecked={false}
                        />
                        <PlayerAbsoluteSidebar2
                            episodes={episodes}
                            activeEpisodeNumber={activeEpisodeNumber}
                            onEpisodeChange={onEpisodeChange}
                        />
                    </>
                );
            }
        }
    };

    return (
        <div className="col-span-1 order-1 flex flex-col gap-1 relative z-10">
            <style>{`
                .plyr--video { --plyr-color-main: #22d3ee; border-radius: 8px; }
                .CustomSidebarScroll::-webkit-scrollbar { width: 4px; }
                .CustomSidebarScroll::-webkit-scrollbar-track { bg: transparent; }
                .CustomSidebarScroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
                .plyr__progress input[type=range]:focus-visible,
                .plyr__progress input[type=range]:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
            `}</style>

            <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-900 aspect-video relative group plyr-dark-theme flex items-center justify-center">

                {activeQuality ? (
                    <>
                        {/* 1. Trình phát Plyr (Đã dọn dẹp trùng lặp thuộc tính source) */}
                        <Plyr
                            ref={plyrRefCallback}
                            options={PLYR_OPTIONS}
                            source={{
                                type: 'video',
                                sources: [], // Luồng HLS m3u8 của bạn được load tự động qua Hls.js phía trên
                                attributes: {
                                    playsinline: 'true',
                                    'webkit-playsinline': 'true' // Ép Safari không tự mở trình phát mặc định của iOS
                                }
                            }}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Đang chuẩn bị luồng phát phim...
                    </div>
                )}

                {loadingVideo && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30 pointer-events-none gap-2">
                        <LoadingOutlined className="animate-spin text-3xl text-cyan-400" />
                        <span className="text-sm text-zinc-300 font-medium tracking-wide">Đang tải video...</span>
                    </div>
                )}

            </div>


            <div className="flex justify-between items-center bg-[#1a1c23] border border-gray-800 p-3 rounded-lg text-xs text-gray-400">
                <span className="hover:text-cyan-400 cursor-pointer flex items-center gap-1">
                    <LeftOutlined size={10} /> Mở rộng màn hình
                </span>
                {activeEpisodeNumber && (
                    <span className="text-cyan-400 font-semibold">Bạn đang xem Tập {activeEpisodeNumber}</span>
                )}
                <span className="hover:text-cyan-400 cursor-pointer">Tập Trước</span>
            </div>

            {qualities.length > 0 && (
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
                                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm'
                                        : 'bg-[#222531] text-gray-400 border-gray-800 hover:border-emerald-500/40 hover:text-emerald-400'
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