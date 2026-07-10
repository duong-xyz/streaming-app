import { useState, useEffect, useRef } from 'react';
import { SearchOutlined, LoadingOutlined, CloseOutlined, StarFilled } from '@ant-design/icons';
import movieService from '../../services/movieService';
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Trạng thái cho Dropdown trên Desktop
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Trạng thái cho Overlay trên Mobile
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const searchRef = useRef(null);
    const resultsContainerRef = useRef(null);
    const mobileInputRef = useRef(null);

    // Mảng dữ liệu mẫu "Gợi ý cho bạn"
    const recommendations = [
        { id: 1, title: "Đại Đạo Triều Thiên", score: 4.5, thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2025/06/dai-vien-hon.webp" },
        { id: 2, title: "Thiên Tướng", score: 4.5, thumbnailUrl: "https://picsum.photos" },
        { id: 3, title: "Trảm Thần: Phàm Trần Thần Vực", score: 4.5, thumbnailUrl: "https://picsum.photos" },
        { id: 4, title: "Thôn Phệ Tinh Không Movie: Quyết Chiến", score: 4.9, thumbnailUrl: "https://picsum.photos" },
        { id: 5, title: "Liêu Trai: Lan Nhược Tự", score: 4.7, thumbnailUrl: "https://picsum.photos" },
        { id: 6, title: "Trạch Thiên Ký", score: 4.8, thumbnailUrl: "https://picsum.photos" },
    ];
    // Logic Debounce gọi API tìm kiếm trực tiếp
    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            setLoading(false);
            setFocusedIndex(-1);
            return;
        }

        setLoading(true);
        const delayDebounceTimer = setTimeout(async () => {
            try {
                const data = await movieService.searchMovies(searchTerm);
                const moviesList = data?.content || [];
                setResults(moviesList);
                setFocusedIndex(-1);
            } catch (error) {
                console.error("Lỗi tìm kiếm phim:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceTimer);
    }, [searchTerm]);

    // Tự động focus vào ô input khi giao diện Mobile được bật lên
    useEffect(() => {
        if (isMobileOpen && mobileInputRef.current) {
            mobileInputRef.current.focus();
        }
    }, [isMobileOpen]);

    // Đóng dropdown trên desktop khi click ra ngoài vùng tìm kiếm
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Xử lý di chuyển bằng bàn phím (Mũi tên lên / xuống & Enter) trên Desktop
    const handleKeyDown = (e) => {
        if (!isOpenDropdown || results.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) => {
                const next = prev < results.length - 1 ? prev + 1 : 0;
                scrollIntoView(next);
                return next;
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) => {
                const next = prev > 0 ? prev - 1 : results.length - 1;
                scrollIntoView(next);
                return next;
            });
        } else if (e.key === "Enter") {
            if (focusedIndex >= 0 && focusedIndex < results.length) {
                e.preventDefault();
                handleSelectMovie(results[focusedIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpenDropdown(false);
        }
    };
    const scrollIntoView = (index) => {
        const container = resultsContainerRef.current;
        if (!container) return;
        const items = container.querySelectorAll('.dropdown-item');
        if (items[index]) {
            items[index].scrollIntoView({ block: 'nearest' });
        }
    };

    const handleSelectMovie = (movie) => {
        console.log("Phim được chọn:", movie);
        navigate(`/movie/${movie.id}`);
        setIsOpenDropdown(false);
        setIsMobileOpen(false);
        setSearchTerm("");
    };

    // ==================== BẮT ĐẦU PHẦN 1/2 ====================
    return (
        <>
            {/* ==================== 1. GIAO DIỆN TÌM KIẾM TRÊN MOBILE CHUẨN GỐC HALIM THEMES ==================== */}
            <div className="block md:hidden ms-auto select-none font-sans">
                {/* Icon tìm kiếm nhỏ gọn trên Header Mobile - Nâng cấp tone vàng Gold rực sáng bừng chân kính */}
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-full border-none bg-transparent cursor-pointer outline-none"
                >
                    <SearchOutlined
                        className="text-[20px]"
                        style={{
                            color: '#e8c872',
                            filter: 'drop-shadow(0 0 5px rgba(232,200,114,0.45))'
                        }}
                    />
                </button>

                {/* Giao diện tìm kiếm phủ toàn màn hình - Chuyển đổi sang màu nền đen mực sẫm đặc nguyên khối của hoathinh3d.st */}
                {isMobileOpen && (
                    <div className="fixed inset-0 z-[99999] bg-[#0c0818] flex flex-col opacity-100 pointer-events-auto translate-y-0 transition-all duration-200 ease-out">

                        {/* Thanh chặn đầu Ô tìm kiếm mobile - Phân tách mỏng bằng vạch chỉ hổ phách vàng mờ */}
                        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[rgba(232,200,114,0.12)] bg-[#0c0818] shrink-0">
                            {loading ? (
                                <LoadingOutlined className="!text-[#5ec4a0] text-[20px] shrink-0 animate-spin drop-shadow-[0_0_6px_rgba(94,196,160,0.4)]" />
                            ) : (
                                <SearchOutlined className="!text-[#c4b896] text-[20px] shrink-0 opacity-75" />
                            )}

                            {/* Ô Input nhập dữ liệu mobile - Ép thanh mực nhấp nháy chuyển sang màu ngọc bích Jade */}
                            <input
                                ref={mobileInputRef}
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#f0e4c8] font-medium [caret-color:#5ec4a0] py-1 min-w-0 placeholder:text-[#c4b896]/40"
                            />

                            {/* Nút tác vụ Đóng / Xóa từ khóa - Đồng bộ dải màu hoathinh3d */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (searchTerm) setSearchTerm("");
                                    else setIsMobileOpen(false);
                                }}
                                className="bg-transparent border-none p-1 cursor-pointer text-[#c4b896]/60 shrink-0 flex items-center transition-colors duration-200 hover:text-[#5ec4a0] active:text-[#5ec4a0] outline-none"
                            >
                                <CloseOutlined className="text-sm" />
                            </button>
                        </div>

                        {/* Vùng chứa cuộn danh sách kết quả tìm kiếm mobile */}
                        <div className="flex-1 overflow-y-auto py-1 [WebkitOverflowScrolling:touch] scrollbar-none">
                            {searchTerm.trim() !== "" ? (
                                /* Khu vực kết xuất mảng danh sách kết quả thật khi gõ chữ - Phủ màu ngọc bích mờ khi hover */
                                <ul className="list-none p-0 m-0">
                                    {results.length > 0 ? (
                                        results.map((movie) => (
                                            <li key={`mobile-res-${movie.id}`} className="px-2 py-0">
                                                <a
                                                    onClick={() => handleSelectMovie(movie)}
                                                    className="block p-0 no-underline rounded-lg transition-colors duration-140 ease-out hover:bg-[rgba(94,196,160,0.05)] active:bg-[rgba(94,196,160,0.05)] cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3.5 p-2.5">
                                                        {/* Khung ảnh Poster tỷ lệ vàng thu nhỏ bọc viền vàng mờ */}
                                                        <div className="shrink-0 w-10 h-14 overflow-hidden rounded border border-[rgba(232,200,114,0.15)] shadow-md bg-neutral-950">
                                                            <img src={movie.thumbnailUrl || movie.posterUrl || "/placeholder-poster.jpg"} alt={movie.title} className="w-full h-full object-cover block" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                                                            <span className="text-xs font-bold leading-[1.4] text-[#f0e4c8] line-clamp-2 transition-colors duration-200 hover:text-[#5ec4a0]">{movie.title}</span>
                                                            <span className="text-[10px] text-[#c4b896] opacity-75 truncate capitalize">{movie.alternativeTitle || "Chưa cập nhật"}</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        ))
                                    ) : (
                                        !loading && <div className="text-center py-16 text-[#c4b896]/30 text-xs font-medium tracking-wide">Không tìm thấy kết quả phù hợp</div>
                                    )}
                                </ul>
                            ) : (
                                /* Gợi ý cho bạn / Trending Mobile - Đổi sang nhãn Ngọc Bích phát quang độc quyền */
                                <div className="flex-1 overflow-y-auto [WebkitOverflowScrolling:touch] pb-4">
                                    <div className="px-4 pt-4 pb-2 text-[11px] font-black text-[#5ec4a0] tracking-[0.8px] uppercase flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(94,196,160,0.3)]">
                                        <span>✨</span> Gợi ý cho bạn
                                    </div>

                                    <div className="flex flex-col px-2 py-0 gap-1.5">
                                        {recommendations.map((movie) => (
                                            <div key={`recommend-${movie.id}`} onClick={() => handleSelectMovie(movie)} className="block no-underline text-inherit group cursor-pointer">
                                                <div className="flex items-center gap-3.5 p-2.5 rounded-lg hover:bg-[rgba(94,196,160,0.05)] transition-colors duration-200">
                                                    <div className="relative w-10 h-14 overflow-hidden rounded border border-[rgba(232,200,114,0.15)] bg-neutral-950 shrink-0">
                                                        <img src={movie.thumbnailUrl || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                                                        <span className="text-xs font-bold leading-[1.4] text-[#f0e4c8] line-clamp-2 group-hover:text-[#5ec4a0] transition-colors duration-200">{movie.title}</span>
                                                        <span className="text-[10px] text-[#e8c872] font-semibold tracking-wide truncate">{movie.score ? `★ Điểm: ${movie.score}` : "Chưa cập nhật"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* ==================== 2. GIAO DIỆN TÌM KIẾM TRÊN DESKTOP CHUẨN GỐC HALIM THEMES ==================== */}
{/* BẬC THẦY SỬA LỖI: Ép cứng tọa độ tâm tuyệt đối vào chính component Search mà không cần chạm vào file Header cha */}
<div ref={searchRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block w-90 xl:w-140 max-w-md group z-50 select-none font-sans">
                {/* Khung nhập liệu tìm kiếm chính: Đập bỏ màu xám lạnh rác, chuyển sang đen sẫm bọc viền vàng nhạt mờ chuẩn Halim */}
                <div className="relative flex items-center bg-[#140e28]/60 border border-[rgba(232,200,114,0.15)] rounded-full focus-within:rounded-md px-4 py-2 transition-all duration-250 focus-within:border-[#5ec4a0]/50 focus-within:shadow-[0_0_15px_rgba(94,196,160,0.12)]">
                    {loading ? (
                        <LoadingOutlined className="!text-[#5ec4a0] text-base mr-2 animate-spin drop-shadow-[0_0_6px_rgba(94,196,160,0.4)]" />
                    ) : (
                        <SearchOutlined className="!text-[#c4b896] group-hover:!text-[#5ec4a0] cursor-pointer transition-colors duration-200 text-base mr-2 opacity-80" />
                    )}
                    <input
                        type="text"
                        placeholder="Tìm kiếm phim..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpenDropdown(true);
                        }}
                        onFocus={() => setIsOpenDropdown(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-[#f0e4c8] font-medium placeholder:text-[#c4b896]/30 text-sm outline-none border-none [caret-color:#5ec4a0]"
                    />
                </div>

                {/* BẢNG ĐỔ DROPDOWN KẾT QUẢ DESKTOP: Đúc đặc màu đen chì sẫm mịn bg-[#0c0818] chặn đứng 100% lỗi đè nhìn xuyên thấu */}
                <div
                    className={`absolute top-[calc(100%+8px)] inset-x-0 z-50 bg-[#0c0818] border border-[rgba(232,200,114,0.12)] rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.65)] pt-1 pb-3 max-h-[72vh] transition-all duration-200 ease-out
                            overflow-y-auto custom-movie-scrollbar
                            ${isOpenDropdown && searchTerm.trim() !== ""
                            ? 'opacity-100 visible translate-y-0'
                            : 'opacity-0 invisible -translate-y-1.5'}`}
                >
                    {/* Tiêu đề trạng thái kết quả đồng bộ hệ màu Ngọc Bích Jade */}
                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 text-[11px] font-black tracking-[0.6px] uppercase text-[#5ec4a0] drop-shadow-[0_0_6px_rgba(94,196,160,0.25)]">
                        <SearchOutlined className="text-sm text-[#e8c872]" />
                        <span>Kết quả cho: <span className="text-[#f0e4c8] lowercase italic font-medium">"{searchTerm}"</span></span>
                    </div>

                    {/* Danh sách các bộ phim kết xuất live-search kết hợp đổi màu Ngọc mượt mà */}
                    <div ref={resultsContainerRef} className="list-none m-0 p-0">
                        {results.length > 0 ? (
                            results.map((movie, index) => (
                                <div key={`desktop-res-${movie.id || index}`} className="px-2 py-0.5">
                                    <a
                                        className={`dropdown-item block p-0 no-underline rounded transition-colors duration-200 ease-out cursor-pointer
                                            ${index === focusedIndex 
                                                ? 'bg-[rgba(94,196,160,0.08)] text-[#5ec4a0] border-l-2 border-[#5ec4a0]' 
                                                : 'text-[#f0e4c8] hover:bg-[rgba(94,196,160,0.04)] hover:text-[#5ec4a0]'}`}
                                        onClick={() => handleSelectMovie(movie)}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                    >
                                        <div className="flex items-center gap-3.5 p-2">
                                            {/* Khung Poster ảnh nhỏ thu nhỏ ép cứng size bọc viền mờ hổ phách */}
                                            <div className="shrink-0 w-10 h-14 overflow-hidden rounded border border-[rgba(232,200,114,0.15)] bg-neutral-950 shadow-md">
                                                <img src={movie.thumbnailUrl || movie.posterUrl || "/placeholder-poster.jpg"} alt={movie.title} className="w-full h-full object-cover block" />
                                            </div>
                                            
                                            {/* Khối chữ đổi sắc sang màu ngọc dịu mát khi hover / hover bàn phím */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                                                <span className={`text-xs font-bold leading-[1.4] line-clamp-2 transition-colors duration-200
                                                    ${index === focusedIndex ? 'text-[#5ec4a0]' : 'text-[#f0e4c8]'}`}
                                                >
                                                    {movie.title}
                                                </span>
                                                <span className="text-[10px] text-[#c4b896] opacity-75 truncate capitalize">
                                                    {movie.alternativeTitle || movie.subTitle || "Đang cập nhật..."}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))
                        ) : (
                            !loading && <div className="text-center py-10 text-[#c4b896]/30 text-xs font-medium tracking-wide">Không tìm thấy kết quả phù hợp</div>
                        )}
                    </div>
                </div>
            </div>

        </>
    );
};

// ==================== KẾT THÚC PHẦN 2/2 ====================

