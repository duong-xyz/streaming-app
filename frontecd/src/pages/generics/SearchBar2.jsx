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

    return (
        <>
            {/* ==================== 1. GIAO DIỆN TRÊN MOBILE (DƯỚI MD) ==================== */}
            <div className="block md:hidden ms-auto">
                {/* Icon tìm kiếm nhỏ gọn trên Header Mobile */}
                <button
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-gray-300 hover:text-white border-none bg-transparent cursor-pointer"
                >
                    <SearchOutlined
                        className="text-[20px]"
                        style={{
                            color: '#00b8db',
                            filter: 'drop-shadow(0.8px 0px 0px #164e63) drop-shadow(-0.8px 0px 0px #164e63)'
                        }}
                    />
                </button>

                {/* Giao diện tìm kiếm phủ toàn màn hình khi click vào icon */}
                {isMobileOpen && (
                    /* #search-fullscreen-overlay và trạng thái hoạt động .active gắn liền thông qua State */
                    <div className="fixed inset-0 z-[99999] bg-[#171e24] flex flex-col opacity-100 pointer-events-auto translate-y-0 transition-all duration-200 ease-out">

                        {/* .search-overlay-header */}
                        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#273e52] bg-[#171e24] shrink-0">
                            {loading ? (
                                <LoadingOutlined className="!text-[#888] text-[22px] shrink-0 animate-spin" />
                            ) : (
                                <SearchOutlined className="!text-[#888] text-[22px] shrink-0" />
                            )}

                            {/* #search-overlay-input */}
                            <input
                                ref={mobileInputRef}
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-[17px] text-white [caret-color:#7aa6ce] py-1 min-w-0 placeholder:text-[#555]"
                            />

                            {/* #search-overlay-close */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (searchTerm) setSearchTerm("");
                                    else setIsMobileOpen(false);
                                }}
                                className="bg-transparent border-none p-1 cursor-pointer text-[#888] shrink-0 flex items-center transition-colors duration-150 hover:text-white active:text-white"
                            >
                                <CloseOutlined className="text-base" />
                            </button>
                        </div>

                        {/* .search-overlay-results */}
                        <div className="flex-1 overflow-y-scroll py-1 [WebkitOverflowScrolling:touch] scrollbar-thin scrollbar-thumb-[#273e52] scrollbar-track-transparent">
                            {searchTerm.trim() !== "" ? (
                                /* Khu vực hiển thị kết quả tìm kiếm kết hợp cấu trúc li.exact_result và .halim_list_item */
                                <ul className="list-none p-0 m-0">
                                    {results.length > 0 ? (
                                        results.map((movie) => (
                                            <li key={`mobile-res-${movie.id}`} className="px-2 py-0">
                                                <a
                                                    onClick={() => handleSelectMovie(movie)}
                                                    className="block p-0 no-underline rounded-lg transition-colors duration-140 ease-out hover:bg-[#1e262d] active:bg-[#1e262d] cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 p-2">
                                                        <div className="shrink-0 w-10 h-14 overflow-hidden rounded-[5px]">
                                                            <img src={movie.thumbnailUrl || "/placeholder-poster.jpg"} alt={movie.title} className="w-10 h-14 object-cover block" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                                                            <span className="text-sm text-white font-semibold leading-[1.35] line-clamp-2">{movie.title}</span>
                                                            <span className="text-xs text-[#7d9db9] truncate">{movie.alternativeTitle || "Chưa cập nhật"}</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        ))
                                    ) : (
                                        !loading && <div className="text-center py-12 text-[#555] text-sm">Không tìm thấy kết quả phù hợp</div>
                                    )}
                                </ul>
                            ) : (
                                /* .search-overlay-suggestions (Gợi ý cho bạn / Trending) */
                                <div className="flex-1 overflow-y-auto [WebkitOverflowScrolling:touch] pb-4">
                                    <div className="px-4 pt-3 pb-2 text-xs font-semibold text-[#8a97a6] tracking-[0.4px] uppercase flex items-center gap-1.5">
                                        <span>✨</span> Gợi ý cho bạn
                                    </div>

                                    <div className="flex flex-col px-2 py-0 gap-2">
                                        {recommendations.map((movie) => (
                                            <div key={`recommend-${movie.id}`} onClick={() => handleSelectMovie(movie)} className="block no-underline text-inherit group cursor-pointer">
                                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e262d] transition-colors">
                                                    <div className="relative w-10 h-14 overflow-hidden rounded-[5px] bg-[#1a2530] shrink-0">
                                                        <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover block transition-transform duration-200 group-hover:scale-104" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                                                        <span className="text-sm text-white font-semibold leading-[1.35] line-clamp-2">{movie.title}</span>
                                                        <span className="text-xs text-[#7d9db9] truncate">{movie.score ? `Điểm: ${movie.score}` : "Chưa cập nhật"}</span>
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
            {/* ==================== GIAO DIỆN TRÊN DESKTOP (TỪ MD TRỞ LÊN) ==================== */}
            <div ref={searchRef} className="relative hidden md:block w-90 xl:w-140 max-w-md group z-50">
                {/* Khung nhập liệu tìm kiếm chính */}
                <div className="relative flex items-center bg-[#1a1c23] border border-[#262933] rounded-full focus-within:rounded-lg px-4 py-2 transition-all duration-200">
                    {loading ? (
                        <LoadingOutlined className="!text-cyan-400 text-base mr-2 animate-spin" />
                    ) : (
                        <SearchOutlined className="!text-white group-hover:!text-cyan-400 cursor-pointer transition-colors text-base mr-2" />
                    )}
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpenDropdown(true);
                        }}
                        onFocus={() => setIsOpenDropdown(true)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-white placeholder:text-gray-400 text-sm outline-none border-none"
                    />
                </div>

                {/* BẢNG ĐỔ DROPDOWN KẾT QUẢ DESKTOP */}
                <div
                    className={`absolute top-[calc(100%+8px)] inset-x-0 z-50 bg-[#171e24] border border-[#273e52] rounded-xl shadow-[0_18px_48px_rgba(0,0,0,0.55)] pt-1 pb-3 max-h-[72vh] transition-all duration-180 ease-out
                            overflow-y-auto custom-movie-scrollbar
                            ${isOpenDropdown && searchTerm.trim() !== ""
                            ? 'opacity-100 visible translate-y-0'
                            : 'opacity-0 invisible -translate-y-1.5'}`}
                >
                    {/* Tiêu đề trạng thái kết quả */}
                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 text-xs font-semibold tracking-[0.4px] uppercase text-[#8a97a6]">
                        <SearchOutlined className="text-[15px] text-[#7aa6ce]" />
                        <span>Kết quả cho: <span className="text-cyan-400 lowercase italic font-normal">"{searchTerm}"</span></span>
                    </div>

                    {/* Danh sách các bộ phim */}
                    <div ref={resultsContainerRef} className="list-none m-0 p-0">
                        {results.length > 0 ? (
                            results.map((movie, index) => (
                                <div key={`desktop-res-${movie.id || index}`} className="px-2 py-0">
                                    <a
                                        className={`dropdown-item block p-0 no-underline rounded-lg transition-colors duration-140 ease-out cursor-pointer
                                ${index === focusedIndex ? 'bg-[#1e262d]' : 'hover:bg-[#1e262d]/60'}`}
                                        onClick={() => handleSelectMovie(movie)}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                    >
                                        <div className="flex items-center gap-3 p-2">
                                            <div className="shrink-0 w-10 h-14 overflow-hidden rounded-[5px]">
                                                <img src={movie.thumbnailUrl || "/placeholder-poster.jpg"} alt={movie.title} className="w-10 h-14 object-cover block" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px]">
                                                <span className="text-sm text-white font-semibold leading-[1.35] line-clamp-2">{movie.title}</span>
                                                <span className="text-xs text-[#7d9db9] truncate">{movie.alternativeTitle || "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))
                        ) : (
                            !loading && <div className="text-center py-8 text-[#555] text-xs">Không tìm thấy kết quả</div>
                        )}
                    </div>
                </div>
            </div>

        </>
    );
}
