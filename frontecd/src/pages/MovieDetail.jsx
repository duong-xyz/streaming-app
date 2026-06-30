import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    PlayCircleOutlined, StarFilled, CalendarOutlined, 
    FieldTimeOutlined, EyeOutlined, MessageOutlined, 
    PlusOutlined, SortAscendingOutlined, SortDescendingOutlined,
    SearchOutlined
} from '@ant-design/icons';
import movieService from '../services/movieService'; // Đổi đường dẫn thực tế tới file service của bạn

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
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-cyan-400 text-sm font-medium tracking-wide">
                Đang tải thông tin chi tiết phim...
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-gray-500 text-sm font-medium">
                Không tìm thấy dữ liệu bộ phim tương ứng.
            </div>
        );
    }

    // Xác định số thứ tự của tập phim mới nhất dựa trên mảng episodes gốc
    const latestEpNum = movie.episodes && movie.episodes.length > 0 
        ? Math.max(...movie.episodes.map(e => e.episodeNumber)) 
        : 0;
    return (
        <div className="min-h-screen bg-[#0b0f17] text-gray-200 font-sans antialiased pb-12">
            
            {/* KHU VỰC BANNER THÔNG TIN PHIM BACKGROUND BLUR */}
            <div className="relative w-full overflow-hidden bg-gray-950/80 border-b border-gray-900">
                {/* Lớp nền ảnh mờ Backdrop tạo chiều sâu không gian hiển thị */}
                <div 
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${movie.posterUrl || movie.thumbnailUrl})` }}
                />
                
                {/* Nội dung chính bọc căn giữa */}
                <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-6 md:gap-8 z-10">
                    
                    {/* Poster phim dạng dọc dọc */}
                    <div className="w-44 h-60 md:w-56 md:h-76 flex-shrink-0 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl border border-gray-800 bg-gray-900">
                        <img 
                            src={movie.thumbnailUrl || movie.posterUrl || "/placeholder-poster.jpg"} 
                            alt={movie.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Khối chữ chi tiết nội dung bên phải */}
                    <div className="flex flex-col flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">{movie.title}</h1>
                        <h2 className="text-gray-400 text-sm md:text-base font-light mt-1 mb-4">{movie.alternativeTitle}</h2>

                        {/* Thẻ phân loại Tags thể loại phim */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 font-medium">CN Animation</span>
                            <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">Cổ Trang</span>
                            <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">Huyền Huyễn</span>
                            <span className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">Tiên Hiệp</span>
                        </div>

                        {/* Thông số kỹ thuật phụ kèm icon */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-400 mb-4">
                            <span className="bg-cyan-500 text-gray-950 font-bold px-2 py-0.5 rounded-sm text-xs">
                                Tập {latestEpNum}
                            </span>
                            <span className="flex items-center gap-1">
                                <CalendarOutlined /> 2023
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400">
                                <FieldTimeOutlined /> {movie.status === "ONGOING" ? `Đang ra (${movie.schedule || "Chưa có lịch"})` : "Hoàn thành"}
                            </span>
                            <span className="flex items-center gap-1">
                                <EyeOutlined /> {movie.viewsTotal?.toLocaleString() || 0} lượt xem
                            </span>
                        </div>

                        {/* Khối chức năng Đánh giá / Tương tác */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-6">
                            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm md:text-base">
                                <StarFilled className="mb-0.5" /> 4.63/5
                                <span className="text-xs text-gray-500 font-normal ml-0.5">(49833 lượt)</span>
                            </div>
                            <button className="text-xs bg-amber-500 hover:bg-amber-600 text-gray-950 font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-all cursor-pointer">
                                <StarFilled /> Đánh giá
                            </button>
                            <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded flex items-center gap-1 border border-gray-700 transition-all cursor-pointer">
                                <PlusOutlined /> Theo dõi
                            </button>
                            <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded flex items-center gap-1 border border-gray-700 transition-all cursor-pointer">
                                <MessageOutlined /> Bình luận <span className="text-[10px] bg-orange-500 text-white px-1 rounded-full font-bold">101.8K</span>
                            </button>
                        </div>

                        {/* Nút Khởi chạy trình xem video (Xem Phim) */}
                        <div className="mt-auto">
                            <button 
                                onClick={() => {
                                    if (processedEpisodes.length > 0) {
                                        //navigate(`/watch/${movie.id}`, { state: { targetEpisodeId: processedEpisodes[processedEpisodes.length - 1].id } });
                                        navigate(`/watch/${movie.id}`);
                                    }
                                }}
                                className="w-full md:w-fit bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transform active:scale-98 transition-all text-base cursor-pointer"
                            >
                                <PlayCircleOutlined className="text-xl" /> Xem Phim
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            {/* KHU VỰC TABS PHẦN PHIM & DANH SÁCH CÁC TẬP PHIM */}
            <div className="max-w-6xl mx-auto px-4 mt-6">
                
                {/* Khung chuyển Tab các phần phim đã xử lý nhóm */}
                <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
                    {Object.keys(episodeGroups).map((tabName) => (
                        <button
                            key={tabName}
                            onClick={() => {
                                setActiveTab(tabName);
                                setSearchEpisode(""); 
                            }}
                            className={`px-4 py-1.5 text-xs md:text-sm font-semibold rounded transition-all duration-150 cursor-pointer
                                ${activeTab === tabName 
                                    ? 'bg-cyan-500 text-gray-950 shadow-md shadow-cyan-500/10' 
                                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                                }`}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>

                {/* THANH ĐIỀU KHIỂN: Ô NHẬP TÌM TẬP NHANH & NÚT SẮP XẾP */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-4">
                    <div className="flex items-center gap-2 text-sm text-amber-500 font-bold uppercase tracking-wider select-none">
                        <span className="w-1.5 h-4 bg-amber-500 rounded-xs block"></span> Chọn Tập
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                        {/* Nút Đảo chiều tăng hoặc giảm danh sách tập phim */}
                        <button 
                            onClick={() => setIsDesc(!isDesc)}
                            title={isDesc ? "Xếp từ cũ đến mới" : "Xếp từ mới đến cũ"}
                            className="flex items-center justify-center bg-[#171e2a] border border-[#2d3748] hover:border-cyan-500 w-9 h-9 text-gray-400 hover:text-cyan-400 rounded transition-all cursor-pointer"
                        >
                            {isDesc ? <SortDescendingOutlined className="text-lg" /> : <SortAscendingOutlined className="text-lg" />}
                        </button>

                        {/* Ô Input lọc tìm số tập phim */}
                        <div className="relative flex items-center bg-[#171e2a] border border-[#2d3748] focus-within:border-cyan-500 rounded px-3 py-1.5 w-full sm:w-48 transition-all">
                            <SearchOutlined className="text-gray-500 mr-2 text-sm" />
                            <input 
                                type="text"
                                placeholder="Nhập số tập..."
                                value={searchEpisode}
                                onChange={(e) => setSearchEpisode(e.target.value)}
                                className="w-full bg-transparent text-white text-xs outline-none border-none placeholder:text-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* KHUNG LƯỚI GRID HIỂN THỊ CÁC Ô TẬP PHIM */}
                <div className="bg-[#111622] border border-[#1e293b]/60 rounded-lg p-4">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3 select-none">
                        🇻🇳 VIỆT SUB
                    </div>
                    
                    {processedEpisodes.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {processedEpisodes.map((ep) => (
                                <div 
                                    key={ep.id}
                                    onClick={() => navigate(`/watch/${movie.id}`, { state: { targetEpisodeId: ep.id } })}
                                    className="bg-[#1c2333] hover:bg-cyan-500 text-gray-300 hover:text-gray-950 border border-gray-800/80 hover:border-cyan-400 rounded py-2 text-center text-xs md:text-sm font-medium cursor-pointer shadow-sm transform active:scale-95 transition-all duration-100"
                                    title={ep.name}
                                >
                                    {ep.episodeNumber}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12 text-sm">
                            Không tìm thấy tập phim tương ứng với bộ lọc.
                        </div>
                    )}
                </div>

                {/* KHỐI HIỂN THỊ MÔ TẢ NỘI DUNG TÓM TẮT DƯỚI CÙNG */}
                <div className="mt-8 border-t border-gray-900 pt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-bold uppercase tracking-wider mb-3 select-none">
                        <span className="w-1.5 h-4 bg-gray-500 rounded-xs block"></span> Nội Dung Phim
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed text-justify whitespace-pre-line bg-[#111622]/40 p-4 rounded-lg border border-gray-900/60">
                        {movie.description || "Nội dung phim đang được cập nhật..."}
                    </p>
                </div>

            </div>
        </div>
    );
}
