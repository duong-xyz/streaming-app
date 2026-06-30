import React, { useState, useEffect, useRef } from 'react';
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

    // Mảng dữ liệu mẫu "Gợi ý cho bạn" hiển thị trên giao diện Mobile khi chưa gõ từ khóa
    const recommendations = [
        { id: 1, title: "Đại Đạo Triều Thiên", score: 4.5, thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2025/06/dai-vien-hon.webp" },
        { id: 2, title: "Thiên Tướng", score: 4.5, thumbnailUrl: "https://picsum.photos" },
        { id: 3, title: "Trảm Thần: Phàm Trần Thần Vực", score: 4.5, thumbnailUrl: "https://picsum.photos" },
        { id: 4, title: "Thôn Phệ Tinh Không Movie: Quyết Chiến", score: 4.9, thumbnailUrl: "https://picsum.photos" },
        { id: 5, title: "Liêu Trai: Lan Nhược Tự", score: 4.7, thumbnailUrl: "https://picsum.photos" },
        { id: 6, title: "Trạch Thiên Ký", score: 4.8, thumbnailUrl: "https://picsum.photos" },
    ];
    // Logic Debounce gọi API tìm kiếm trực tiếp (Đồng bộ chính xác biến searchTerm)
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
                    <div className="fixed inset-0 bg-[#0b0f17] z-50 flex flex-col overflow-y-auto">
                        {/* Thanh tìm kiếm đầu trang */}
                        <div className="flex items-center bg-[#171e2a] border-b border-[#2d3748] px-3 py-2">
                            {loading ? (
                                <LoadingOutlined className="!text-cyan-400 text-lg mr-2.5 animate-spin" />
                            ) : (
                                <SearchOutlined className="!text-gray-400 text-lg mr-2.5" /> 
                            )}
                            <input
                                ref={mobileInputRef}
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent text-white placeholder:text-gray-500 text-base outline-none border-none"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (searchTerm) setSearchTerm("");
                                    else setIsMobileOpen(false);
                                }}
                                className="text-gray-400 hover:text-white ml-2 p-1 border-none bg-transparent cursor-pointer"
                            >
                                <CloseOutlined className="text-base" />
                            </button>
                        </div>

                        {/* VÙNG FIX LỖI TÌM KIẾM MOBILE: Danh sách đổ dọc chạy theo từ khóa động */}
                        {searchTerm.trim() !== "" ? (
                            <div className="mt-4 flex flex-col divide-y divide-[#1e293b]/50 px-4">
                                {results.length > 0 ? (
                                    results.map((movie) => (
                                        <div
                                            key={`mobile-res-${movie.id}`}
                                            onClick={() => handleSelectMovie(movie)}
                                            className="flex items-center py-3 active:bg-gray-800/50 cursor-pointer"
                                        >
                                            <img src={movie.thumbnailUrl || movie.posterUrl || "/placeholder-poster.jpg"} alt={movie.title} className="w-10 h-14 object-cover rounded mr-3 shrink-0" />
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-gray-200 text-sm font-medium truncate">{movie.title}</span>
                                                <span className="text-gray-500 text-xs truncate mt-0.5">{movie.alternativeTitle || "Chưa cập nhật"}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    !loading && <div className="text-center text-gray-500 py-10 text-sm">Không tìm thấy kết quả phù hợp</div>
                                )}
                            </div>
                        ) : (
                            /* Khu vực danh sách "GỢI Ý CHO BẠN" dạng lưới khi ô nhập đang trống */
                            <div className="mt-6 px-4">
                                <div className="flex items-center text-gray-400 text-xs font-semibold tracking-wider uppercase mb-4">
                                    <span className="text-orange-500 text-sm mr-1.5">✨</span> Gợi ý cho bạn
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {recommendations.map((movie) => (
                                        <div key={`recommend-${movie.id}`} onClick={() => handleSelectMovie(movie)} className="relative group cursor-pointer flex flex-col">
                                            <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-gray-900 border border-gray-800">
                                                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />

                                                {/* Badge Điểm đánh giá */}
                                                <div className="absolute top-1 right-1 flex items-center bg-black/60 backdrop-blur-xs px-1 py-0.5 rounded text-[10px] text-yellow-400 font-bold gap-0.5">
                                                    <StarFilled className="text-[9px]" />
                                                    {movie.score}
                                                </div>

                                                {/* Tiêu đề phim phủ dưới chân ảnh */}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2 pt-6">
                                                    <p className="text-white text-[11px] font-medium leading-tight line-clamp-2">
                                                        {movie.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* ==================== 2. GIAO DIỆN TRÊN DESKTOP (TỪ MD TRỞ LÊN) ==================== */}
            <div ref={searchRef} className="relative hidden md:block w-80 max-w-xs group z-50">
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

                {/* BẢNG ĐỔ KẾT QUẢ DROPDOWN CỦA DESKTOP */}
                {isOpenDropdown && searchTerm.trim() !== "" && (
                    <div className="absolute top-[115%] left-0 w-full bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[450px]">
                        <div className="p-3 text-xs text-[#94a3b8] border-b border-[#1e293b]">
                            Kết quả tìm kiếm: <span className="text-red-500 font-bold ml-1">{searchTerm}</span>
                        </div>

                        <div ref={resultsContainerRef} className="overflow-y-auto divide-y divide-[#1e293b]/50 custom-scrollbar">
                            {results.length > 0 ? (
                                results.map((movie, index) => (
                                    <div
                                        key={`desktop-res-${movie.id || index}`}
                                        className={`dropdown-item flex items-center p-3 cursor-pointer transition-all duration-150
                                            ${index === focusedIndex ? 'bg-[#1e293b] text-white' : 'hover:bg-[#1e293b]/60'}`}
                                        onClick={() => handleSelectMovie(movie)}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                    >
                                        <img src={movie.thumbnailUrl || "/placeholder-poster.jpg"} alt={movie.title} className="w-10 h-14 object-cover rounded-sm mr-3" />
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-gray-200 text-sm font-medium truncate">{movie.title}</span>
                                            <span className="text-gray-500 text-xs truncate mt-0.5">{movie.alternativeTitle || "Chưa cập nhật"}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !loading && <div className="p-5 text-center text-sm text-gray-500">Không tìm thấy kết quả phù hợp</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
