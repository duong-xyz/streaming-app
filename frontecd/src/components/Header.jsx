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

    return (
        <>
            {/* THANH HEADER CHUẨN */}
            <header className='relative sticky top-0 z-50 xl:relative xl:top-auto xl:z-auto bg-[#0b0c10] px-4 md:px-6 h-16 2xl:px-21 flex items-center justify-between overflow-visible'>

                {/* ================= KHU VỰC TRÁI: LOGO VÀ NAV DESKTOP ================= */}
                <div className='flex items-center gap-6 h-full'>
                    {/* NÚT MỞ MOBILE MENU */}
                    <button
                        type="button"
                        onClick={() => setOpenMobileMenu(!openMobileMenu)}
                        className='xl:hidden flex items-center justify-center border border-white/5 p-2 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer'
                    >
                        <MenuOutlined className="text-lg" />
                    </button>

                    {/* LOGO TRANG WEB */}
                    <Link
                        to="/"
                        onClick={() => navigate('/')}
                        className='flex items-center gap-0.5 text-xl hover:opacity-95 transition-all duration-300 mr-2 group select-none relative h-full py-2 scale-100 hover:scale-[1.02]'
                    >
                        {/* 1. DẢI MÂY THẦN TIÊN BÊN TRÁI ĐẦU LOGO (Giống cụm mây vàng trong ảnh mẫu) */}
                        <span className="absolute -left-2 top-2 text-[10px] opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none filter sepia hue-rotate-15">☁️</span>

                        {/* 2. CHỮ X - Đậm đà, bo góc tròn trịa kết hợp bóng đổ mềm */}
                        <span className='font-sans text-[26px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-500 drop-shadow-[0_3px_6px_rgba(34,211,238,0.4)] relative antialiased'>
                            X
                        </span>

                        {/* 3. BIỂU TƯỢNG CHU TƯỚC LỬA CHIBI (Đứng canh ở giữa chữ X và Y giống như chú gấu trúc Chibi ở giữa ảnh mẫu) */}
                        <span className="relative flex flex-col items-center justify-center text-xl mx-[-2px] z-10 animate-bounce [animation-duration:3s]">
                            {/* Hào quang hỏa diễm chân khí phát sáng xung quanh thần thú */}
                            <span className="absolute animate-ping inline-flex h-3 w-3 rounded-full bg-orange-500 opacity-60"></span>
                            {/* Thần thú Chu Tước hệ Hỏa cách điệu dễ thương */}
                            <span className="relative filter drop-shadow-[0_2px_5px_#f97316] text-[22px] group-hover:rotate-12 transition-transform duration-300">🐦‍🔥</span>
                        </span>

                        {/* 4. CHỮ YZ - Nối đuôi mập mạp vững chãi */}
                        <span className='font-sans text-[26px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-400 to-blue-500 drop-shadow-[0_3px_6px_rgba(34,211,238,0.4)] antialiased mr-0.5'>
                            YZ
                        </span>

                        {/* 5. PHẦN ĐUÔI .EE CÁCH ĐIỆU - Nhỏ nhắn, màu vàng cam hoàng gia làm điểm nhấn kết thúc */}
                        <span className='font-sans text-[18px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] self-end mb-1.5 ml-0.5 relative'>
                            .ee
                            {/* Chim hạc nhỏ bay lượn trên đỉnh đuôi .ee giống như cánh chim trắng ở ảnh mẫu */}
                            <span className="absolute -top-3 -right-2 text-[8px] opacity-50 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-500">🕊️</span>
                        </span>

                        {/* 6. DẢI MÂY THẦN TIÊN PHÍA DƯỚI ĐUÔI LOGO */}
                        <span className="absolute -right-2 bottom-1 text-[9px] opacity-30 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none filter sepia">☁️</span>
                    </Link>



                    {/* MENU ĐIỀU HƯỚNG DESKTOP */}
                    <nav className="hidden xl:flex items-center gap-1 font-bold text-[13px] tracking-wide text-gray-300 h-full font-sans">

                    </nav>
                </div>
                {/* THANH TÌM KIẾM CHÍNH GIỮA */}
                <SearchBar />

                {/* ================= KHU VỰC PHẢI: USER PROFILE ================= */}
                <div className='flex items-center gap-3 sm:gap-4'>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-block text-gray-400 text-xs font-semibold tracking-wide font-sans">
                                Chào, <span className="text-cyan-400 font-black">{user?.username}</span>
                            </span>

                            {/* USER DROPDOWN */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setOpenDropdown(!openDropdown)}
                                    className='block cursor-pointer border-2 border-white/10 hover:border-cyan-400 rounded-full shadow-lg transition-all focus:outline-none overflow-hidden'
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user?.username}
                                            className="w-[32px] h-[32px] rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-[32px] h-[32px] rounded-full bg-zinc-800 flex items-center justify-center text-gray-300 hover:text-white">
                                            <UserOutlined className="text-sm" />
                                        </div>
                                    )}
                                </button>

                                {/* Menu Dropdown hiển thị theo trạng thái click */}
                                {openDropdown && (
                                    <div className="absolute right-0 mt-3 w-48 bg-[#15171e]/95 border border-white/5 rounded-xl shadow-2xl py-1.5 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 font-sans">
                                        <div className="absolute -top-1 right-3.5 w-2 h-2 bg-[#15171e] border-t border-l border-white/5 rotate-45"></div>

                                        {isAdmin && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setOpenDropdown(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/[0.03] hover:text-cyan-400 transition-all duration-200"
                                            >
                                                <DashboardOutlined className="text-sm" />
                                                <span>Trang quản trị</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            onClick={() => setOpenDropdown(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/[0.03] hover:text-cyan-400 transition-all duration-200"
                                        >
                                            <UserOutlined className="text-sm" />
                                            <span>Trang cá nhân</span>
                                        </Link>
                                        <hr className="border-white/5 my-1" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpenDropdown(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all duration-200 text-left cursor-pointer"
                                        >
                                            <LogoutOutlined className="text-sm" />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Cụm nút khi người dùng chưa đăng nhập */
                        <div className='flex items-center gap-1 sm:gap-2 font-sans'>
                            <Link to="/register" className='hidden md:inline-block text-gray-400 hover:text-cyan-400 font-bold px-3 py-1.5 rounded-xl hover:bg-white/[0.02] transition-all text-xs sm:text-sm'>
                                Đăng ký
                            </Link>
                            <Link to="/login" className="hidden md:inline-block bg-gradient-to-r from-cyan-500 to-blue-500 min-w-[90px] text-center text-black hover:brightness-110 font-black px-4 py-1.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-xs sm:text-sm tracking-wide">
                                Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </header>
            {/* 1. THẺ CHA: Nhiệm vụ dính đỉnh và tạo dải nền tràn viền khít sát 100% màn hình xuyên suốt */}
            <div className="hidden xl:flex xl:sticky xl:top-0 xl:z-40 items-center h-12 w-full bg-[#0b0c10] header-parent-sticky group">

                {/* Nút Menu Mobile */}
                <div className="flex max-[1200px]:flex xl:hidden items-center justify-center px-4 h-full text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-bold text-[14px] cursor-pointer"></div>

                {/* CỤM DANH SÁCH NÚT ĐIỀU HƯỚNG (THẺ CON) */}
                <div className="hidden xl:flex max-[1200px]:hidden bg-[#1a1c23]/40 rounded border-b border-[#27272a] shadow-lg items-center gap-1 font-bold text-4 tracking-wide text-gray-300 h-full w-auto flex-1 mx-6 xl:mx-[84px] overflow-x-auto overflow-y-visible whitespace-nowrap scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory transition-all duration-300 menu-khoi-1"
                >
                    {/* Nút Trang chủ */}
                    <Link to="/" className="shrink-0 snap-start relative flex items-center gap-1.5 px-4 bg-[#111217] hover:bg-[#16171d] h-full text-cyan-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-100">
                        <HomeOutlined className="text-6" /> Trang chủ
                    </Link>

                    {/* Nút TẬP HỢP DROPDOWN THỂ LOẠI */}
                    <div className="shrink-0 snap-start relative h-full flex items-center bg-[#111217] hover:bg-[#16171d] transition-colors duration-300 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 hover:after:scale-x-100" ref={genreDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setOpenGenreDropdown(!openGenreDropdown)}
                            className={`flex items-center gap-1.5 px-4 h-full transition-all duration-300 cursor-pointer border-none bg-transparent font-bold text-[13px] ${openGenreDropdown ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}
                        >
                            <AppstoreOutlined className="text-6" />
                            <span>Thể Loại</span>
                            <span className={`text-[9px] transition-transform duration-300 ${openGenreDropdown ? 'rotate-180 text-cyan-400' : 'text-gray-500'}`}>▼</span>
                        </button>

                        {/* DROPDOWN MENU ĐỔ XUỐNG */}
                        {openGenreDropdown && (
                            <div className="fixed top-12 mt-0.5 w-44 bg-[#14161f]/98 border border-white/5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="absolute -top-1 left-8 w-2 h-2 bg-[#14161f] border-t border-l border-white/5 rotate-45"></div>
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
                                        className="block px-5 py-2.5 text-[12px] font-semibold text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200 text-left whitespace-normal"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nút Phim lẻ */}
                    <Link to="/?category=movie-le" className="shrink-0 snap-start flex items-center gap-1.5 px-4 h-full bg-[#111217] hover:bg-[#16171d] text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <VideoCameraOutlined className="text-6" /> Phim Lẻ
                    </Link>

                    {/* Nút Đang chiếu */}
                    <Link to="/schedule" className="shrink-0 snap-start flex items-center gap-1.5 px-4 h-full bg-[#111217] hover:bg-[#16171d] text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <FieldTimeOutlined className="text-6" /> Lịch Chiếu
                    </Link>
                </div>

                <div className="hidden max-[1200px]:hidden border-b border-white/[0.08] shadow-lg shadow-black/50 items-center gap-1 font-bold text-4 tracking-wide text-gray-300 h-full w-full mx-0 px-6 xl:px-[84px] overflow-x-auto overflow-y-visible whitespace-nowrap scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory transition-all duration-300 menu-khoi-2 style-hidden"
                >
                    {/* Nút Trang chủ */}
                    <Link to="/" className="shrink-0 snap-start relative flex items-center gap-1.5 px-4 bg-[#111217] hover:bg-[#16171d] h-full text-cyan-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-100">
                        <HomeOutlined className="text-6" /> Trang chủ
                    </Link>

                    {/* Nút TẬP HỢP DROPDOWN THỂ LOẠI */}
                    <div className="shrink-0 snap-start relative h-full flex items-center bg-[#111217] hover:bg-[#16171d] transition-colors duration-300 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 hover:after:scale-x-100" ref={genreDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setOpenGenreDropdown(!openGenreDropdown)}
                            className={`flex items-center gap-1.5 px-4 h-full transition-all duration-300 cursor-pointer border-none bg-transparent font-bold text-[13px] ${openGenreDropdown ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}
                        >
                            <AppstoreOutlined className="text-6" />
                            <span>Thể Loại</span>
                            <span className={`text-[9px] transition-transform duration-300 ${openGenreDropdown ? 'rotate-180 text-cyan-400' : 'text-gray-500'}`}>▼</span>
                        </button>

                        {/* DROPDOWN MENU ĐỔ XUỐNG */}
                        {openGenreDropdown && (
                            <div className="fixed top-12 mt-0.5 w-44 bg-[#14161f]/98 border border-white/5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="absolute -top-1 left-8 w-2 h-2 bg-[#14161f] border-t border-l border-white/5 rotate-45"></div>
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
                                        className="block px-5 py-2.5 text-[12px] font-semibold text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200 text-left whitespace-normal"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nút Phim lẻ */}
                    <Link to="/?category=movie-le" className="shrink-0 snap-start flex items-center gap-1.5 px-4 h-full bg-[#111217] hover:bg-[#16171d] text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <VideoCameraOutlined className="text-6" /> Phim Lẻ
                    </Link>

                    {/* Nút Đang chiếu */}
                    <Link to="/schedule" className="shrink-0 snap-start flex items-center gap-1.5 px-4 h-full bg-[#111217] hover:bg-[#16171d] text-gray-300 hover:text-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <FieldTimeOutlined className="text-6" /> Lịch Chiếu
                    </Link>
                </div>
            </div>






            <MobileMenu openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} />

        </>
    );
};

export default memo(Header);
