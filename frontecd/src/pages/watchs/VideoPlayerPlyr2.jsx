import React, { memo, useRef, useEffect } from 'react';
import { LeftOutlined, MonitorOutlined, LoadingOutlined } from '@ant-design/icons';
import { Plyr } from 'plyr-react';
import Hls from 'hls.js';

const VideoPlayerArea = ({
    loadingVideo,
    activeEpisodeNumber,
    qualities,
    activeQuality,
    onQualityChange
}) => {
    const hlsRef = useRef(null);
    const videoElementRef = useRef(null); // Lưu trữ thẻ video thật để đổi chất lượng mượt mà

    // Hàm lõi chịu trách nhiệm găm dữ liệu HLS vào trình phát
    const loadHlsStream = (videoElement, url) => {
        if (!videoElement || !url) return;

        console.log("Kích hoạt nạp luồng phát HLS m3u8 thành công:", url);

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            // const hls = new Hls({
            //     // --- 1. TỐI ƯU BỘ ĐỆM AN TOÀN CHỐNG GIẬT (ANTI-STALL BUFFER) ---
            //     maxBufferLength: 30,          // Luôn cố gắng tải trước 30 giây video gối đầu khi đang xem bình thường
            //     maxMaxBufferLength: 60,       // Trần bộ đệm tối đa 60 giây (gấp đôi cũ) để tích lũy dữ liệu khi mạng khỏe
            //     maxBufferSize: 80 * 1024 * 1024, // Tăng trần bộ đệm lên 80MB để chứa đủ các đoạn phim 1080p có bitrate cao
            //     maxBufferHole: 1,             // Cho phép bỏ qua lỗ hổng dữ liệu lên đến 1 giây để phim trôi liên tục không bị khựng

            //     // --- 2. QUẢN LÝ LUỒNG TẢI TRÁNH NGHẼN BĂNG THÔNG (AWAITING MANAGEMENT) ---
            //     enableWorker: true,
            //     lowLatencyMode: false,
            //     progressive: true,

            //     // --- 3. KIỂM SOÁT TỐC ĐỘ ĐỌC VÀ CHỜ PHÂN ĐOẠN ĐẶC BIỆT ---
            //     // Ép hls.js ưu tiên sự ổn định của bộ đệm thay vì nạp dồn dập gây nghẽn mạng
            //     backBufferLength: 30,         // Giữ lại 30 giây video đã xem ở bộ nhớ đệm trước để lỡ người dùng có lùi lại nhẹ không phải tải lại

            //     // --- 4. TĂNG TỐC ĐỘ THỬ LẠI KHI MẠNG TRỒI SỤT (HIGH AVAILABILITY) ---
            //     nudgeMaxRetry: 10,            // Tăng lên 10 lần nhích để tự cứu khi video bị đứng hình do lỗi mạng
            //     nudgePercent: 0.2,            // Nhích 0.2 giây mỗi lần để nhanh chóng tìm thấy đoạn dữ liệu tiếp theo
            //     appendErrorMaxRetry: 10,

            //     // --- 5. TỐI ƯU THỜI GIAN CHỜ VÀ PHẢN HỒI RE-REQUEST (TIMEOUT TUNING) ---
            //     // Thay vì chờ đợi quá lâu khi một phân đoạn bị nghẽn, tự động hủy và tải lại ngay
            //     manifestLoadingTimeOut: 15000, // Giới hạn chờ tải danh sách chất lượng tối đa 15 giây
            //     levelLoadingTimeOut: 15000,    // Giới hạn chờ tải một phân đoạn video tối đa 15 giây
            //     fragLoadingTimeOut: 15000,     // Giới hạn chờ nạp một mảnh video tối đa 15 giây

            //     manifestLoadingMaxRetry: 6,   // Tăng số lần tải lại lên 6 lần
            //     levelLoadingMaxRetry: 6,      // Tăng số lần tải lại lên 6 lần
            //     fragLoadingMaxRetry: 6,
            // });

            const hls = new Hls({
                // --- 1. CÂN BẰNG LẠI BỘ ĐỆM ĐỂ TĂNG TỐC TUA PHIM (SEEK SPEED TUNING) ---
                maxBufferLength: 15,          // Giảm từ 30s xuống 15s: Đủ an toàn chống giật, nhưng quay xe cực nhanh khi tua
                maxMaxBufferLength: 30,       // Khống chế trần tối đa 30s (thay vì 60s) để tránh làm nghẽn băng thông khi tua
                maxBufferSize: 40 * 1024 * 1024, // Giới hạn bộ đệm khoảng 40MB là vừa đủ cho luồng phim 1080p hoat-hinh
                maxBufferHole: 0.5,           // Hạ xuống 0.5s để trình duyệt xử lý lỗ hổng dữ liệu nhạy hơn

                // --- 2. CẮT GIẢM BỘ ĐỆM LỊCH SỬ ĐỂ GIẢI PHÓNG RAM LẬP TỨC ---
                backBufferLength: 5,          // CHỐT CHẶN VÀNG: Chỉ giữ lại 5s video đã xem, xóa ngay dữ liệu cũ để dồn RAM nạp đoạn tua mới

                // --- 3. ĐỒNG BỘ LUỒNG CHẠY NGẦM ---
                enableWorker: true,
                lowLatencyMode: false,
                progressive: true,

                // --- 4. CẤU HÌNH TỰ CỨU THÔNG MINH KHI KHỰNG HÌNH DO TUA ĐOẠN MỚI ---
                nudgeMaxRetry: 8,             // Tự động nhích nhẹ tối đa 8 lần nếu tua trúng điểm mù phân đoạn
                nudgePercent: 0.1,            // Nhích khoảng ngắn 0.1s giúp video bắt nhịp phát lại tức thì không bị đứng hình
                appendErrorMaxRetry: 5,

                // --- 5. RÚT NGẮN THỜI GIAN CHỜ ĐỂ TÁI KẾT NỐI NHANH (TIMEOUT TUNING) ---
                // Nếu gói tin bị nghẽn khi tua, hủy và xin lại gói mới ngay sau 5-6 giây thay vì bắt người dùng đợi 15 giây
                manifestLoadingTimeOut: 6000,
                levelLoadingTimeOut: 6000,
                fragLoadingTimeOut: 6000,     // Chờ nạp mảnh video tối đa 6 giây khi tua, quá hạn tự re-request dòng mới

                manifestLoadingMaxRetry: 4,
                levelLoadingMaxRetry: 4,
                fragLoadingMaxRetry: 4,
            });


            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            // Sửa đổi block sự kiện MANIFEST_PARSED trong hàm loadHlsStream:
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // CHẶN ĐỨNG LỆNH TỰ PHÁT: Khóa dòng dưới đây lại để trình duyệt không tự chạy video khi đổi tập
                // videoElement.play().catch(() => { }); 
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
        }
    };

    // ==========================================================================
    // 1. THEO DÕI ĐỔI CHẤT LƯỢNG HOẶC ĐỔI TẬP PHIM CHÍNH XÁC KHÔNG LỆCH PHA
    // ==========================================================================
    useEffect(() => {
        // Trích xuất URL m3u8 chuẩn bất kể kiểu dữ liệu là Object hay String
        const url = activeQuality?.m3u8Url || (typeof activeQuality === 'string' ? activeQuality : null);

        // Nếu Plyr đã dựng xong thẻ video và tìm thấy đường link phim mới
        if (videoElementRef.current && url) {
            console.log("Phát hiện thay đổi tập phim/chất lượng! Tiến hành kích hoạt nạp luồng...");
            loadHlsStream(videoElementRef.current, url);
        }
    }, [activeQuality]); // Khối này sẽ tự động chạy lại mỗi khi bấm đổi tập hoặc đổi độ phân giải

    // ==========================================================================
    // 2. HỦY LUỒNG GIẢI MÃ KHI NGƯỜI DÙNG TẮT HOẶC CHUYỂN TRANG (CHỐNG RÒ RỈ BỘ NHỚ)
    // ==========================================================================
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                console.log("Người dùng rời khỏi trang xem phim. Hủy toàn bộ thực thể HLS ngầm...");
                hlsRef.current.detachMedia();
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            // Xóa sạch tham chiếu phần tử DOM khi component unmount
            videoElementRef.current = null;
        };
    }, []);
    // ==========================================================================
    // 3. CALLBACK REF MẠNH MẼ - ĐỒNG BỘ THẺ VIDEO NGAY KHI PLYR KHỞI TẠO XONG
    // ==========================================================================
    const plyrRefCallback = (node) => {
        if (node && node.plyr) {
            const nativeVideo = node.plyr.media; // Bóc tách chính xác thẻ video HTML5 lõi từ Plyr

            // Cập nhật liên tục thẻ video mới nhất (đặc biệt hữu ích khi Plyr làm mới cấu trúc lúc đổi tập)
            if (nativeVideo && videoElementRef.current !== nativeVideo) {
                console.log("Plyr đã dựng xong DOM! Đã khóa chặt thẻ video thật vào hệ thống Ref.");
                videoElementRef.current = nativeVideo;

                const url = activeQuality?.m3u8Url || (typeof activeQuality === 'string' ? activeQuality : null);
                if (url) {
                    loadHlsStream(nativeVideo, url); // Ép nạp m3u8 ngay lập tức cho lần đầu tiên vào trang
                }
            }
        }
    };


    const plyrOptions = {
        controls: [
            'play-large', 'rewind', 'play', 'fast-forward', 'progress',
            'current-time', 'duration', 'mute', 'volume',
            'settings', 'pip', 'fullscreen'
        ],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        seekTime: 10,
        keyboard: {
            focused: true,  // Kích hoạt phím tắt khi đang nhấn vào video
            global: true    // Kích hoạt phím tắt toàn trang (kể cả khi vừa đổi tập xong)
        }
    };

    return (
        <div className="col-span-1 order-1 flex flex-col gap-1">
            <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-900 aspect-video relative group plyr-dark-theme flex items-center justify-center">

                {activeQuality ? (
                    <Plyr
                        ref={plyrRefCallback} // Kích hoạt cơ chế Callback Ref đồng bộ chuẩn hóa mới
                        source={{ type: 'video', sources: [] }}
                        options={plyrOptions}
                    />
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

            {/* Bộ chọn chất lượng */}
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

            {/* style */}

        </div>
    );
};

// Khắc phục lỗi SyntaxError của Vite bằng cách gán tên biến tường minh trước khi Default Export
const MemoizedVideoPlayerArea = memo(VideoPlayerArea);
export default MemoizedVideoPlayerArea;
