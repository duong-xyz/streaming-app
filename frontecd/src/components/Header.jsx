import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../store/slice/authSlice';
import { message } from 'antd';
import {
    MenuOutlined, UserOutlined, DashboardOutlined,
    LogoutOutlined, LeftOutlined,
    HomeOutlined, AppstoreOutlined, VideoCameraOutlined, FieldTimeOutlined
} from '@ant-design/icons';
import { useState, useRef, useEffect, memo } from 'react';
import SearchBar from '../pages/generics/SearchBar2';
import MobileMenu from './MobileMenu';

const Header = () => {
    const { isAuthenticated, user, isAdmin } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);

    // Khai báo state và ref phục vụ riêng cho Dropdown Thể loại mới
    const [openGenreDropdown, setOpenGenreDropdown] = useState(false);
    const genreDropdownRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        message.success('Đăng xuất thành công');
        navigate('/');
    };

    // Click bên ngoài đóng cả 2 menu dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
            if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
                setOpenGenreDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef, genreDropdownRef]);

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') setOpenMobileMenu(false);
        }
        if (openMobileMenu) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [openMobileMenu]);

    // ==================== BẮT ĐẦU PHẦN 1/4 ====================
    // LOGIC EXPERT BỔ SUNG: Bắt sự kiện cuộn chuột để kích hoạt thay đổi giá trị cho biến isStuck
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Khi cuộn trang chuột qua khỏi mốc Header lớn (64px), bật trạng thái Stuck dính đỉnh
            if (window.scrollY > 64) {
                setIsStuck(true);
            } else {
                setIsStuck(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* 1. THANH HEADER CHÍNH TRÊN CÙNG: Trạng thái relative tĩnh, KHÔNG CÓ BORDER-B, tự động ẩn khuất khi cuộn trang xuống */}
            <header className={`relative bg-[#0c0818] px-4 md:px-6 h-16 2xl:px-20 flex items-center justify-between overflow-visible select-none border-none transition-all duration-200 ${
                isStuck ? "opacity-0 pointer-events-none invisible h-0" : "opacity-100 pointer-events-auto"
            }`}>

                {/* ================= KHU VỰC TRÁI: LOGO VÀ NAV MOBILE BUTTON ================= */}
                <div className="flex items-center gap-6 h-full shrink-0">
                    {/* NÚT BẤM MỞ SIDEBAR DI ĐỘNG CẤU TRÚC THEO .navbar-toggle */}
                    <button
                        type="button"
                        onClick={() => setOpenMobileMenu(!openMobileMenu)}
                        className="xl:hidden flex items-center justify-center border border-[rgba(232,200,114,0.15)] p-2 rounded-xl bg-[rgba(232,200,114,0.03)] hover:bg-[rgba(94,196,160,0.1)] text-[#e8c872] hover:text-[#5ec4a0] hover:border-[#5ec4a0]/40 transition-all duration-250 cursor-pointer outline-none"
                    >
                        <MenuOutlined className="text-lg" />
                    </button>

                    {/* LOGO ĐIỆN ẢNH CÁCH ĐIỆU CHU TƯỚC CHIBI */}
                    <Link
                        to="/"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-0.5 text-xl hover:opacity-95 transition-all duration-200 mr-2 group relative h-full py-2 scale-100 hover:scale-[1.01]"
                        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                    >
                        <span className="absolute -left-2 top-2 text-[10px] opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none filter sepia">☁️</span>
                        <span className="font-sans text-[26px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-500 drop-shadow-[0_3px_6px_rgba(34,211,238,0.4)] relative antialiased">X</span>
                        <span className="relative flex flex-col items-center justify-center text-xl mx-[-2px] z-10 animate-bounce [animation-duration:3s]">
                            <span className="absolute animate-ping inline-flex h-3 w-3 rounded-full bg-orange-500 opacity-60"></span>
                            <span className="relative filter drop-shadow-[0_2px_5px_#f97316] text-[22px] group-hover:rotate-12 transition-transform duration-300">🐦‍🔥</span>
                        </span>
                        <span className="font-sans text-[26px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-500 drop-shadow-[0_3px_6px_rgba(34,211,238,0.4)] antialiased mr-0.5">YZ</span>
                        <span className="font-sans text-[18px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] self-end mb-1.5 ml-0.5 relative">
                            .ee
                            <span className="absolute -top-3 -right-2 text-[8px] opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-500">🕊️</span>
                        </span>
                        <span className="absolute -right-2 bottom-1 text-[9px] opacity-30 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none filter sepia">☁️</span>
                    </Link>
                </div>

                {/* THANH TÌM KIẾM CHÍNH GIỮA */}
                <SearchBar />

                {/* ================= KHU VỰC PHẢI: HỒ SƠ THÀNH VIÊN DROPDOWN VIP ================= */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-block text-[#c4b896] text-xs font-semibold tracking-wide font-sans">
                                Chào, <span className="text-[#5ec4a0] font-black">{user?.username}</span>
                            </span>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(!openDropdown)}
                                    className="block cursor-pointer border border-[rgba(232,200,114,0.18)] hover:border-[#5ec4a0] rounded-full shadow-lg transition-all focus:outline-none overflow-hidden outline-none"
                                >
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user?.username} className="w-[32px] h-[32px] rounded-full object-cover" />
                                    ) : (
                                        <div className="w-[32px] h-[32px] rounded-full bg-[#141220] flex items-center justify-center text-[#c4b896] hover:text-white">
                                            <UserOutlined className="text-sm" />
                                        </div>
                                    )}
                                </button>

                                {openDropdown && (
                                    <div className="absolute right-0 mt-3 w-48 bg-[rgba(14,10,28,0.92)] border border-[rgba(232,200,114,0.12)] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-1.5 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
                                        <div className="absolute -top-1 right-3.5 w-2 h-2 bg-[rgba(14,10,28,0.92)] border-t border-l border-[rgba(232,200,114,0.12)] rotate-45"></div>

                                        {isAdmin && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setOpenDropdown(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#c4b896] hover:bg-[rgba(94,196,160,0.05)] hover:text-[#5ec4a0] transition-all duration-200 border-b border-neutral-900/40"
                                            >
                                                <DashboardOutlined className="text-sm text-[#e8c872]" />
                                                <span>Trang quản trị</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            onClick={() => setOpenDropdown(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#c4b896] hover:bg-[rgba(94,196,160,0.05)] hover:text-[#5ec4a0] transition-all duration-200"
                                        >
                                            <UserOutlined className="text-sm text-[#e8c872]" />
                                            <span>Trang cá nhân</span>
                                        </Link>
                                        <hr className="border-white/5 my-1" />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#c45c5c] hover:bg-red-500/5 hover:text-red-400 transition-all duration-200 bg-transparent border-none text-left cursor-pointer outline-none"
                                        >
                                            <LogoutOutlined className="text-sm" />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 font-sans select-none">
                            <Link to="/register" className="text-xs font-bold text-[#c4b896] hover:text-[#5ec4a0] px-3 py-1.5 transition-all">Đăng Ký</Link>
                            <Link to="/login" className="text-xs font-black bg-gradient-to-r from-[#007ba6] to-[#00aae0] text-white px-3.5 py-1.5 rounded shadow-[0_2px_8px_rgba(0,170,224,0.2)] hover:brightness-110 transition-all border-none">Đăng Nhập</Link>
                        </div>
                    )}
                </div>
            </header>
            {/* 2. THANH ĐIỀU HƯỚNG CON SINGLE-DOM: Duy nhất một khối DOM vật lý tự động biến hình linh hoạt khi cuộn trang */}
            {/* PIXEL-PERFECT FIX: Trả về h-12 cố định để tương thích với mốc căn padding dọc của Bootstrap v3 gốc */}
            <div 
                className={`w-full h-12 transition-all duration-250 select-none header-parent-sticky group
                    ${isStuck 
                        ? "fixed top-0 left-0 right-0 z-1030 bg-[#111217] border-b border-[rgba(232,200,114,0.08)] shadow-[0_5px_10px_-1px_rgba(30,31,33,0.6)]" 
                        : "relative bg-[#0c0818]"
                    }`}
            >
                {/* Nút Menu Mobile Phụ rỗng cho cấu trúc layout di động */}
                <div className="flex max-[1200px]:flex xl:hidden items-center justify-center px-4 h-full text-neutral-400 hover:text-[#5ec4a0] transition-colors duration-250 font-bold text-[14px] cursor-pointer"></div>

                {/* EXPERT FIX DYNAMIC MARGIN/PADDING: Hoán đổi mx sang px khi stuck để border-b chiếm trọn vẹn 100% màn hình, giữ nguyên khoảng cách chữ */}
                <div className={`hidden xl:flex h-full bg-transparent items-center gap-1 font-bold text-xs tracking-wide text-[#c4b896] overflow-x-auto overflow-y-visible whitespace-nowrap scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory transition-all duration-300
                    ${isStuck 
                        ? "w-full px-6 xl:px-[84px] bg-[#111217]" 
                        : "w-auto flex-1 mx-6 xl:mx-[84px] bg-[#1a1c23]/40 rounded-lg border-b border-[#27272a] shadow-lg"
                    }`}
                >
                    
                    {/* Nút Trang chủ: Chữ ngọc bích Jade, icon vàng Gold, thanh gầm phát quang Jade */}
                    <Link 
                        to="/" 
                        className={`shrink-0 snap-start relative flex items-center gap-2 px-5 h-full transition-colors duration-250 border-r border-neutral-900/30 after:absolute after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#5ec4a0] after:shadow-[0_-3px_8px_rgba(94,196,160,0.6)] after:scale-x-100
                            ${isStuck ? "bg-[#111217] hover:bg-[#16171d] text-[#5ec4a0]" : "bg-[#111217]/50 hover:bg-[#16171d] text-[#5ec4a0]"}`}
                    >
                        <HomeOutlined className="text-sm text-[#e8c872]" /> 
                        <span>Trang chủ</span>
                    </Link>

                    {/* Nút DROPDOWN THỂ LOẠI (Hệ màu ngọc bích Jade phát quang dưới gầm nút) */}
                    <div className={`shrink-0 snap-start relative h-full flex items-center border-r border-neutral-900/30 transition-colors duration-250 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#5ec4a0] after:shadow-[0_-3px_8px_rgba(94,196,160,0.6)] after:scale-x-0 hover:after:scale-x-100
                        ${isStuck ? "bg-[#111217] hover:bg-[#16171d]" : "bg-transparent"}`} ref={genreDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setOpenGenreDropdown(!openGenreDropdown)}
                            className={`flex items-center gap-1.5 px-5 h-full transition-all duration-200 cursor-pointer border-none bg-transparent font-bold text-[13px] outline-none ${
                                openGenreDropdown ? 'text-[#5ec4a0]' : 'text-[#c4b896] hover:text-[#5ec4a0]'
                            }`}
                        >
                            <AppstoreOutlined className="text-sm text-[#e8c872]" />
                            <span>Thể Loại</span>
                            <span className={`text-[8px] ml-1 transition-transform duration-200 ${openGenreDropdown ? 'rotate-180 text-[#5ec4a0]' : 'text-neutral-500'}`}>▼</span>
                        </button>
                        {/* SINGLE-DOM DROPDOWN FIX: Luôn ghim khít chân thanh h-11 tại vị trí top-11, không lo lệch vách hay trong suốt */}
                        {openGenreDropdown && (
                            <div className="fixed top-11 mt-0.5 w-44 bg-[#111217] border border-[rgba(232,200,114,0.12)] rounded-lg shadow-2xl py-1.5 z-50 backdrop-blur-md animate-in fade-in duration-200">
                                <div className="absolute -top-1 left-8 w-2 h-2 bg-[#111217] border-t border-l border-[rgba(232,200,114,0.12)] rotate-45"></div>
                                {[
                                    { name: 'Huyền Huyễn', slug: 'huyen-huyen' },
                                    { name: 'Xuyên Không', slug: 'xuyen-khong' },
                                    { name: 'Trùng Sinh', slug: 'trung-sinh' },
                                    { name: 'Tiên Hiệp', slug: 'tien-hiep' },
                                    { name: 'Cổ Trang', slug: 'co-trang' },
                                    { name: 'Hài Hước', slug: 'hai-huoc' },
                                    { name: 'Kiếm Hiệp', slug: 'kiem-hiep' },
                                    { name: 'Hiện Đại', slug: 'hien-da' }
                                ].map((genre) => (
                                    <Link
                                        key={genre.slug}
                                        to={`/?genre=${genre.slug}`}
                                        onClick={() => setOpenGenreDropdown(false)}
                                        className="block px-5 py-2.5 text-[12px] font-semibold text-[#c4b896] hover:bg-[rgba(94,196,160,0.06)] hover:text-[#5ec4a0] transition-all duration-200 text-left whitespace-normal"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Nút Phim lẻ */}
                    <Link 
                        to="/?category=movie-le" 
                        className="shrink-0 snap-start relative flex items-center gap-2 px-5 h-full bg-[#111217] hover:bg-[#16171d] text-[#c4b896] hover:text-[#5ec4a0] text-[13px] border-r border-neutral-900/30 transition-colors duration-250 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#5ec4a0] after:shadow-[0_-3px_8px_rgba(94,196,160,0.6)] after:scale-x-0 hover:after:scale-x-100"
                    >
                        <VideoCameraOutlined className="text-sm text-[#e8c872]" /> 
                        <span>Phim Lẻ</span>
                    </Link>
                    
                    {/* Nút Lịch chiếu */}
                    <Link 
                        to="/movie/schedule" 
                        className="shrink-0 snap-start relative flex items-center gap-2 px-5 h-full bg-[#111217] hover:bg-[#16171d] text-[#c4b896] hover:text-[#5ec4a0] text-[13px] border-r border-neutral-900/30 transition-colors duration-250 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#5ec4a0] after:shadow-[0_-3px_8px_rgba(94,196,160,0.6)] after:scale-x-0 hover:after:scale-x-100"
                    >
                        <FieldTimeOutlined className="text-sm text-[#e8c872]" /> 
                        <span>Lịch Chiếu</span>
                    </Link>
                </div>
            </div>

            {/* SIDEBAR MOBILE MENU CONNECTOR */}
            <MobileMenu openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} />
        </>
    );
};






export default memo(Header);
