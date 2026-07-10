import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayCircleOutlined, StarFilled, CalendarOutlined,
    FieldTimeOutlined, EyeOutlined, MessageOutlined,
    PlusOutlined, SortAscendingOutlined, SortDescendingOutlined,
    SearchOutlined
} from '@ant-design/icons';
import movieService from '../services/movieService'; // Đổi đường dẫn thực tế tới file service của bạn
import LoadingHH3D from './generics/LoadingHH3D';

export default function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    // State quản lý bộ lọc tập phim
    const [searchEpisode, setSearchEpisode] = useState("");
    const [isDesc, setIsDesc] = useState(true); // Mặc định xếp tập mới nhất lên đầu như ảnh mẫu
    const [activeTab, setActiveTab] = useState("Phần Chính");

    // GỌI API QUA SERVICE: Lấy chi tiết bộ phim theo ID
    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                setLoading(true);
                const data = await movieService.getMovieById(id);
                setMovie(data);

                // Chọn mặc định tab đầu tiên chứa nội dung nếu có dữ liệu tập phim trả về
                const groups = groupEpisodes(data?.episodes || []);
                const availableTabs = Object.keys(groups);
                if (availableTabs.length > 0) {
                    setActiveTab(availableTabs[0]);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu chi tiết phim:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchMovieDetail();
    }, [id]);

    // LOGIC PHÂN LOẠI TẬP PHIM THÀNH CÁC TAB CHỨA NỘI DUNG (Phần Chính, Movie, Ngoại Truyện,...)
    const groupEpisodes = (episodesList) => {
        const groups = {};
        if (!episodesList || episodesList.length === 0) return groups;

        episodesList.forEach(ep => {
            const nameLower = ep.name ? ep.name.toLowerCase() : "";
            let category = "Phần Chính"; // Phân nhóm mặc định cho các tập thường

            if (nameLower.includes("movie") || nameLower.includes("điện ảnh")) {
                category = "Movie";
            } else if (nameLower.includes("ngoại truyện") || nameLower.includes("ova") || nameLower.includes("sp")) {
                category = "Ngoại Truyện";
            } else if (nameLower.includes("thần lâm") || nameLower.includes("chi chiến")) {
                category = "Movie Thần Lâm Chi Chiến"; // Phân nhóm chuẩn khớp ảnh mẫu
            }

            if (!groups[category]) groups[category] = [];
            groups[category].push(ep);
        });
        return groups;
    };

    // Ghi nhớ nhóm tập phim bằng useMemo để tối ưu hóa hiệu năng render dữ liệu
    const episodeGroups = useMemo(() => groupEpisodes(movie?.episodes || []), [movie?.episodes]);

    // XỬ LÝ LỌC TẬP PHIM NHANH QUA INPUT HOẶC ĐẢO CHIỀU TĂNG/GIẢM
    const processedEpisodes = useMemo(() => {
        const currentGroup = episodeGroups[activeTab] || [];

        let filtered = currentGroup.filter(ep => {
            if (!searchEpisode.trim()) return true;
            return ep.episodeNumber.toString() === searchEpisode.trim() ||
                ep.name.toLowerCase().includes(searchEpisode.toLowerCase());
        });

        return [...filtered].sort((a, b) => {
            return isDesc ? b.episodeNumber - a.episodeNumber : a.episodeNumber - b.episodeNumber;
        });
    }, [episodeGroups, activeTab, searchEpisode, isDesc]);

    if (loading) {
        return (
            <LoadingHH3D />
        );
    }

    // EXPERT UPDATE: Phủ màu đen chì sẫm #0c0818 và màu chữ giấy mờ dịu mát để đồng bộ 100% không khí rạp phim
    if (!movie) {
        return (
            <div className="min-h-screen bg-[#0c0818] flex items-center justify-center text-[#c4b896]/40 text-xs font-semibold tracking-wide font-sans select-none antialiased">
                Không tìm thấy dữ liệu bộ phim tương ứng...
            </div>
        );
    }

    // Xác định số thứ tự của tập phim mới nhất dựa trên mảng episodes gốc
    const latestEpNum = movie.episodes && movie.episodes.length > 0
        ? Math.max(...movie.episodes.map(e => e.episodeNumber))
        : 0;
    return (
        <div className="min-h-screen bg-[#0c0818] text-[#c4b896] font-sans antialiased pb-12 select-none">

            {/* KHU VỰC BANNER THÔNG TIN PHIM BACKGROUND BLUR CHUẨN XỊN HALIM THEMES */}
            <div className="relative w-full overflow-hidden bg-[#0c0818] border-b border-[rgba(232,200,114,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                {/* Lớp nền ảnh mờ Backdrop tạo chiều sâu không gian hiển thị */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-15 scale-105 pointer-events-none filter sepia hue-rotate-15"
                    style={{ backgroundImage: `url(${movie.posterUrl || movie.thumbnailUrl})` }}
                />

                {/* Nội dung chính bọc căn giữa */}
                <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-10 flex flex-col md:flex-row gap-6 md:gap-8 z-10">

                    {/* Poster phim dạng dọc dọc bọc dải viền mờ Hổ phách Gold rực sáng chân kính */}
                    <div className="w-44 h-60 md:w-56 md:h-76 flex-shrink-0 mx-auto md:mx-0 rounded border border-[rgba(232,200,114,0.18)] overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.8)] bg-neutral-950">
                        <img
                            src={movie.thumbnailUrl || movie.posterUrl || "/placeholder-poster.jpg"}
                            alt={movie.title}
                            className="w-full h-full object-cover block"
                        />
                    </div>

                    {/* Khối chữ chi tiết nội dung bên phải */}
                    <div className="flex flex-col flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-[#f0e4c8] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{movie.title}</h1>
                        <h2 className="text-[#c4b896]/60 text-sm md:text-base font-medium mt-1 mb-4 italic capitalize">{movie.alternativeTitle || "Chưa cập nhật tên gốc"}</h2>

                        {/* Thẻ phân loại Tags thể loại phim - Chuyển sang hệ màu Ngọc Bích Jade dịu mát và viền nhung mờ */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-5">
                            <span className="text-[11px] bg-[rgba(94,196,160,0.08)] text-[#5ec4a0] px-3 py-1 rounded border border-[#5ec4a0]/20 font-black tracking-wide uppercase drop-shadow-[0_0_6px_rgba(94,196,160,0.2)]">CN Animation</span>
                            <span className="text-[11px] bg-[rgba(232,200,114,0.03)] text-[#c4b896] px-3 py-1 rounded border border-[rgba(232,200,114,0.1)] font-bold">Cổ Trang</span>
                            <span className="text-[11px] bg-[rgba(232,200,114,0.03)] text-[#c4b896] px-3 py-1 rounded border border-[rgba(232,200,114,0.1)] font-bold">Huyền Huyễn</span>
                            <span className="text-[11px] bg-[rgba(232,200,114,0.03)] text-[#c4b896] px-3 py-1 rounded border border-[rgba(232,200,114,0.1)] font-bold">Tiên Hiệp</span>
                        </div>

                        {/* Thông số kỹ thuật phụ kèm icon */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-xs md:text-sm text-[#c4b896]/70 mb-5 font-medium">
                            <span className="bg-[#5ec4a0] text-gray-950 font-black px-2 py-0.5 rounded-sm text-[11px] tracking-wide shadow-[0_2px_6px_rgba(94,196,160,0.3)]">
                                Tập {latestEpNum}
                            </span>
                            <span className="flex items-center gap-1 opacity-80">
                                <CalendarOutlined className="text-[#e8c872]" /> 2023
                            </span>
                            <span className="flex items-center gap-1 text-[#5ec4a0] font-semibold drop-shadow-[0_0_6px_rgba(94,196,160,0.15)]">
                                <FieldTimeOutlined /> {movie.status === "ONGOING" ? `Đang ra (${movie.schedule || "Chưa có lịch"})` : "Hoàn thành"}
                            </span>
                            <span className="flex items-center gap-1 opacity-80">
                                <EyeOutlined className="text-[#e8c872]" /> {movie.viewsTotal?.toLocaleString() || 0} lượt xem
                            </span>
                        </div>

                        {/* Khối chức năng Đánh giá / Tương tác */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6 font-medium text-xs">
                            <div className="flex items-center gap-1 text-[#e8c872] font-black text-sm md:text-base">
                                <StarFilled className="mb-0.5 drop-shadow-[0_0_6px_rgba(232,200,114,0.4)]" /> 4.63/5
                                <span className="text-xs text-[#c4b896]/40 font-normal ml-0.5">(49,833 lượt)</span>
                            </div>
                            <button className="bg-[rgba(232,200,114,0.1)] hover:bg-[rgba(232,200,114,0.18)] text-[#e8c872] border border-[rgba(232,200,114,0.25)] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-all duration-200 cursor-pointer outline-none">
                                <StarFilled /> Đánh giá
                            </button>
                            <button className="bg-[rgba(94,196,160,0.06)] hover:bg-[rgba(94,196,160,0.15)] text-[#5ec4a0] px-3 py-1.5 rounded flex items-center gap-1 border border-[#5ec4a0]/20 font-bold transition-all duration-200 cursor-pointer outline-none">
                                <PlusOutlined /> Theo dõi
                            </button>
                            <button className="bg-[rgba(232,200,114,0.03)] hover:bg-[rgba(232,200,114,0.08)] text-[#c4b896] px-3 py-1.5 rounded flex items-center gap-1 border border-[rgba(232,200,114,0.1)] transition-all duration-200 cursor-pointer outline-none">
                                <MessageOutlined /> Bình luận <span className="text-[10px] bg-[#ff2070] text-white px-1.5 py-0.5 rounded-full font-black shadow-[0_2px_6px_rgba(255,32,112,0.3)]">101.8K</span>
                            </button>
                        </div>

                        {/* Nút Khởi chạy trình xem video (Xem Phim) - Ép cứng góc bo vuông góc khuyết nhẹ chuẩn HalimThemes */}
                        <div className="mt-auto">
                            <button
                                onClick={() => {
                                    if (processedEpisodes.length > 0) {
                                        navigate(`/watch/${movie.id}`);
                                    }
                                }}
                                className="w-full md:w-fit bg-gradient-to-r from-[#ff8a00] to-[#ff2070] hover:brightness-110 text-white font-black tracking-wide px-10 py-3 rounded-md flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,32,112,0.25)] transform active:scale-[0.99] transition-all text-base cursor-pointer border-none outline-none"
                            >
                                <PlayCircleOutlined className="text-xl text-[#e8c872]" /> Xem Phim
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            {/* KHU VỰC TABS PHẦN PHIM & DANH SÁCH CÁC TẬP PHIM CHUẨN ĐIỆN ẢNH CHU CHUYỂN */}
            <div className="max-w-6xl mx-auto px-4 mt-6">

                {/* Khung chuyển Tab các phần phim - Đồng bộ hệ màu tối sẫm mịn màng */}
                <div className="flex flex-wrap gap-2 border-b border-[rgba(232,200,114,0.08)] pb-3">
                    {Object.keys(episodeGroups).map((tabName) => (
                        <button
                            key={tabName}
                            onClick={() => {
                                setActiveTab(tabName);
                                setSearchEpisode("");
                            }}
                            className={`px-4 py-1.5 text-xs md:text-sm font-bold rounded transition-all duration-200 border cursor-pointer outline-none ${activeTab === tabName
                                    ? 'bg-[#5ec4a0] text-gray-950 border-[#5ec4a0] shadow-[0_3px_10px_rgba(94,196,160,0.25)] font-black'
                                    : 'bg-[#12171b] text-[#c4b896]/60 border-[rgba(232,200,114,0.08)] hover:bg-[#1a1f26] hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30'
                                }`}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>

                {/* THANH ĐIỀU KHIỂN: Ô NHẬP TÌM TẬP NHANH & NÚT SẮP XẾP */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#e8c872] font-black uppercase tracking-wider select-none">
                        <span className="w-1.5 h-4 bg-[#e8c872] rounded-xs block shadow-[0_0_6px_rgba(232,200,114,0.4)]"></span> Chọn Tập
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                        {/* Nút Đảo chiều danh sách tập phim - Nạp tone màu ngọc dịu mát khi hover */}
                        <button
                            onClick={() => setIsDesc(!isDesc)}
                            title={isDesc ? "Xếp từ cũ đến mới" : "Xếp từ mới đến cũ"}
                            className="flex items-center justify-center bg-[#12171b] border border-[rgba(232,200,114,0.08)] hover:border-[#5ec4a0]/40 w-9 h-9 text-[#c4b896]/60 hover:text-[#5ec4a0] rounded transition-all duration-200 cursor-pointer outline-none"
                        >
                            {isDesc ? <SortDescendingOutlined className="text-lg" /> : <SortAscendingOutlined className="text-lg" />}
                        </button>

                        {/* Ô Input lọc tìm số tập phim - Đổi caret-color sang xanh ngọc nhấp nháy */}
                        <div className="relative flex items-center bg-[#12171b] border border-[rgba(232,200,114,0.08)] focus-within:border-[#5ec4a0]/40 rounded px-3 py-1.5 w-full sm:w-48 transition-all duration-200">
                            <SearchOutlined className="text-[#c4b896]/40 mr-2 text-sm" />
                            <input
                                type="text"
                                placeholder="Nhập số tập..."
                                value={searchEpisode}
                                onChange={(e) => setSearchEpisode(e.target.value)}
                                className="w-full bg-transparent text-[#f0e4c8] font-semibold text-xs outline-none border-none placeholder:text-[#c4b896]/20 [caret-color:#5ec4a0]"
                            />
                        </div>
                    </div>
                </div>

                {/* KHUNG LƯỚI GRID HIỂN THỊ CÁC Ô TẬP PHIM */}
                <div className="bg-[#12171b] border border-[rgba(232,200,114,0.05)] rounded-lg p-4 shadow-inner">
                    <div className="text-[10px] text-[#5ec4a0] font-black uppercase tracking-wider mb-3 select-none drop-shadow-[0_0_5px_rgba(94,196,160,0.15)]">
                        🇻🇳 VIỆT SUB
                    </div>

                    {processedEpisodes.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {processedEpisodes.map((ep) => (
                                <div
                                    key={ep.id}
                                    onClick={() => navigate(`/watch/${movie.id}`, { state: { targetEpisodeId: ep.id } })}
                                    className="bg-[#1a1f26] hover:bg-[#5ec4a0] text-[#c4b896] hover:text-gray-950 border border-[rgba(232,200,114,0.05)] hover:border-[#5ec4a0] rounded py-2 text-center text-xs md:text-sm font-bold cursor-pointer shadow-sm transform active:scale-95 transition-all duration-150"
                                    title={ep.name}
                                >
                                    {ep.episodeNumber}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-[#c4b896]/30 py-16 text-xs font-medium tracking-wide">
                            Không tìm thấy tập phim tương ứng với bộ lọc.
                        </div>
                    )}
                </div>

                {/* KHỐI HIỂN THỊ MÔ TẢ NỘI DUNG TÓM TẮT DƯỚI CÙNG */}
                <div className="mt-8 border-t border-[rgba(232,200,114,0.08)] pt-6">
                    <div className="flex items-center gap-2 text-sm text-[#c4b896]/60 font-black uppercase tracking-wider mb-3 select-none">
                        <span className="w-1.5 h-4 bg-[#c4b896]/40 rounded-xs block"></span> Nội Dung Phim
                    </div>
                    <p className="text-[#c4b896]/80 text-sm leading-relaxed text-justify whitespace-pre-line bg-[#12171b]/40 p-5 rounded-lg border border-[rgba(232,200,114,0.04)] font-medium">
                        {movie.description || "Nội dung phim đang được cập nhật..."}
                    </p>
                </div>

            </div>
        </div>
    );
};

