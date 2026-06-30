import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import { message } from 'antd'; // Giữ lại message thông báo hệ thống theo code gốc

import movieService from '../services/movieService';
import videoQualityService from '../services/videoQualityService';

import EpisodeSidebar from './watchs/EpisodeSidebar';
import VideoPlayerArea from './watchs/VideoPlayerPlyr2'; // Gọi đúng file Plyr của bạn
import MovieInfoSidebar from './watchs/MovieInfoSidebar';

function Watch() {
    const { movieId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // --- CẤU TRÚC GỘP NHÓM OBJECT STATE CHỦ ĐẠO (Giữ nguyên 100% logic gốc) ---
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
    const targetEpisodeId = location.state?.targetEpisodeId; 

    // --- EFFECT 1: Tải chi tiết thông tin phim & danh sách tập ---
    useEffect(() => {
        const fetchMovieDetails = async () => {
            setLoadingState(prev => ({ ...prev, movie: true }));
            try {
                const data = await movieService.getMovieById(movieId);
                const episodeList = data.episodes || [];
                const sortedEpisodes = [...episodeList].sort((b, a) => a.episodeNumber - b.episodeNumber);

                setMovieState({
                    detail: data,
                    episodes: sortedEpisodes
                });

                if (sortedEpisodes.length > 0) {
                    let activeEp = sortedEpisodes[0];
                    if (targetEpisodeId) {
                        const foundEp = sortedEpisodes.find(ep => ep.id === targetEpisodeId);
                        if (foundEp) activeEp = foundEp;
                    }
                    setVideoState(prev => ({
                        ...prev,
                        activeEpisodeId: activeEp.id,
                        activeEpisodeNumber: activeEp.episodeNumber
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
    }, [movieId, targetEpisodeId]);

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

    // --- CÁC CALLBACK TỐI ƯU HOÀN TOÀN TRÁNH RE-RENDER VÔ ÍCH ---
    const handleEpisodeChange = useCallback((ep) => {
        setVideoState(prev => ({
            ...prev,
            activeEpisodeId: ep.id,
            activeEpisodeNumber: ep.episodeNumber
        }));
    }, []);

    const handleQualityChange = useCallback((qualityObj) => {
        setVideoState(prev => ({
            ...prev,
            activeQuality: qualityObj
        }));
    }, []);
    return (
        <div className="min-h-screen bg-[#0b0c10] text-gray-200 selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Thanh điều hướng phụ (Breadcrumb) */}
            <div className="bg-[#14161d] px-4 md:px-8 py-3 border-b border-zinc-900 text-xs text-gray-400 flex items-center gap-2">
                <button 
                    type="button"
                    onClick={() => navigate('/')}
                    className="cursor-pointer hover:text-cyan-400 transition-colors focus:outline-none"
                >
                    Trang chủ
                </button>
                <span className="text-zinc-700 select-none">/</span>
                <span className="text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                    {movieState.detail?.title}
                </span>
            </div>

            {/* Khung lưới kết hợp các Component con qua Props */}
            <main className="px-4 md:px-6 py-6 w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-2">
                {/* Thanh danh sách tập phim phía bên trái */}
                <EpisodeSidebar
                    episodes={movieState.episodes}
                    activeEpisodeId={videoState.activeEpisodeId}
                    onEpisodeChange={handleEpisodeChange}
                />

                {/* Khu vực phát Video trung tâm */}
                <VideoPlayerArea
                    loadingVideo={loadingState.video}
                    activeEpisodeNumber={videoState.activeEpisodeNumber}
                    qualities={videoState.qualities}
                    activeQuality={videoState.activeQuality}
                    onQualityChange={handleQualityChange}
                />

                {/* Thanh thông tin phim bổ sung phía bên phải */}
                <MovieInfoSidebar 
                    detail={movieState.detail} 
                    activeQuality={videoState.activeQuality} 
                />
            </main>

            {/* HỆ THỐNG CUSTOM SCROLLBAR: Chuyển đổi gọn gàng sang cú pháp tiêu chuẩn CSS */}
            <style>{`
                .style-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .style-scrollbar::-webkit-scrollbar-track {
                    background: #1a1c23;
                }
                .style-scrollbar::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 2px;
                }
                .style-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #22d3ee;
                }
            `}</style>
        </div>
    );
}

export default Watch;
