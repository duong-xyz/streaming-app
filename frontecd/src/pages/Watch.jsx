import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { Spin, message, Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

// Import dịch vụ API kết nối Backend của bạn
import movieService from '../services/movieService';
import videoQualityService from '../services/videoQualityService';

// Import 3 Sub-Components con vừa tạo ở trên
import EpisodeSidebar from './watchs/EpisodeSidebar';
import VideoPlayerArea from './watchs/VideoPlayerArea';
import MovieInfoSidebar from './watchs/MovieInfoSidebar';

function Watch() {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    // --- GIỮ NGUYÊN HOÀN TOÀN CẤU TRÚC GỘP NHÓM OBJECT STATE CHỦ ĐẠO ---
    const [movieState, setMovieState] = useState({
        detail: null,
        episodes: []
    });

    const [videoState, setVideoState] = useState({
        activeEpisodeId: null,
        activeEpisodeNumber: null,
        qualities: [],
        activeQuality: null
    });

    const [loadingState, setLoadingState] = useState({
        movie: true,
        video: false
    });

    // --- EFFECT 1: Tải chi tiết thông tin phim & danh sách tập ---
    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoadingState(prev => ({ ...prev, movie: true }));
            try {
                const data = await movieService.getMovieById(movieId);
                const episodeList = data.episodes || [];
                const sortedEpisodes = [...episodeList].sort((a, b) => a.episodeNumber - b.episodeNumber);

                setMovieState({
                    detail: data,
                    episodes: sortedEpisodes
                });

                if (sortedEpisodes.length > 0) {
                    setVideoState(prev => ({
                        ...prev,
                        activeEpisodeId: sortedEpisodes[0].id,
                        activeEpisodeNumber: sortedEpisodes[0].episodeNumber
                    }));
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin phim:", error);
                message.error("Không thể tải cấu trúc dữ liệu của bộ phim này!");
            } finally {
                setLoadingState(prev => ({ ...prev, movie: false }));
            }
        };

        if (movieId) fetchMovieDetails();
    }, [movieId]);

    // --- EFFECT 2: Tự động lấy danh sách chất lượng video m3u8 khi đổi tập phim ---
    useEffect(() => {
        const fetchVideoQualities = async () => {
            if (!videoState.activeEpisodeId) return;

            setLoadingState(prev => ({ ...prev, video: true }));
            try {
                const data = await videoQualityService.getAllQualitiesForUser(videoState.activeEpisodeId, 0, 50);
                const qualityList = data.content || [];

                setVideoState(prev => ({
                    ...prev,
                    qualities: qualityList,
                    activeQuality: qualityList.length > 0 ? qualityList[0] : null
                }));
            } catch (error) {
                console.error("Lỗi lấy luồng phát video m3u8:", error);
                message.error("Không thể tải danh sách luồng phát cho tập phim này!");
            } finally {
                setLoadingState(prev => ({ ...prev, video: false }));
            }
        };

        fetchVideoQualities();
    }, [videoState.activeEpisodeId]);

    // --- EFFECT 3: Khởi tạo, gán luồng m3u8 tương thích an toàn với React 19 ---
    useEffect(() => {
        if (!videoState.activeQuality?.m3u8Url || !videoRef.current) return;

        const videoElement = videoRef.current;

        if (Hls.isSupported()) {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }

            //const hls = new Hls({ maxMaxBufferLength: 30 });
            const hls = new Hls({
                maxMaxBufferLength: 60,       // Tăng bộ đệm tối đa lên 60 giây (gấp đôi cũ) để xem mượt khi mạng trồi sụt
                maxBufferLength: 30,          // Luôn giữ tối thiểu 30 giây video tải trước trong bộ nhớ
                enableWorker: true,           // Kích hoạt luồng chạy ngầm (Web Worker) để giải mã video không ăn vào RAM giao diện
                lowLatencyMode: false,        // Tắt chế độ độ trễ thấp để ưu tiên chất lượng hình ảnh và độ mượt dòng chảy
            });

            hls.loadSource(videoState.activeQuality.m3u8Url);
            hls.attachMedia(videoElement);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play().catch(() => { });
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
            videoElement.src = videoState.activeQuality.m3u8Url;
            videoElement.addEventListener('loadedmetadata', () => {
                videoElement.play().catch(() => { });
            });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoState.activeQuality]);

    // Thay thế hàm cũ trong src/pages/Watch.jsx bằng hàm dùng useCallback này:
    const handleEpisodeChange = React.useCallback((ep) => {
        setVideoState(prev => ({
            ...prev,
            activeEpisodeId: ep.id,
            activeEpisodeNumber: ep.episodeNumber
        }));
    }, []);

    const handleQualityChange = React.useCallback((qualityObj) => {
        setVideoState(prev => ({
            ...prev,
            activeQuality: qualityObj
        }));
    }, []);


    if (loadingState.movie) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0e1015]">
                <Spin size="large" tip="Đang tải dữ liệu phim..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c10] text-gray-200">
            {/* Thanh điều hướng phụ */}
            <div className="bg-[#14161d] px-4 md:px-8 py-3 border-b border-gray-900 text-xs text-gray-400 flex items-center gap-2">
                <span className="cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => navigate('/')}>Trang chủ</span>
                <span>/</span>
                <span className="text-gray-200 font-medium truncate">{movieState.detail?.title}</span>
            </div>

            {/* Khung lưới kết hợp các Component con qua Props */}
            <div className="px-4 md:px-6 py-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                <EpisodeSidebar
                    episodes={movieState.episodes}
                    activeEpisodeId={videoState.activeEpisodeId}
                    onEpisodeChange={handleEpisodeChange}
                />

                <VideoPlayerArea
                    videoRef={videoRef}
                    loadingVideo={loadingState.video}
                    activeEpisodeNumber={videoState.activeEpisodeNumber}
                    qualities={videoState.qualities}
                    activeQuality={videoState.activeQuality}
                    onQualityChange={handleQualityChange}
                />

                <MovieInfoSidebar
                    detail={movieState.detail}
                    activeQuality={videoState.activeQuality}
                />

            </div>

            <style>{`
                .style-scrollbar::-webkit-scrollbar { width: 4px; }
                .style-scrollbar::-webkit-scrollbar-track { background: #1a1c23; }
                .style-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
                .style-scrollbar::-webkit-scrollbar-thumb:hover { background: #22d3ee; }
            `}</style>
        </div>
    );
}

export default Watch;
