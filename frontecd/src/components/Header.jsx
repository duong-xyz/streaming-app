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
            <header className='relative bg-[#111217] border-b border-[#27272a] sticky top-0 z-40 px-4 md:px-8 h-16 flex items-center justify-between overflow-visible'>

                {/* ================= KHU VỰC TRÁI: LOGO VÀ NAV DESKTOP ================= */}
                <div className='flex items-center gap-6 h-full'>
                    {/* NÚT MỞ MOBILE MENU */}
                    <button
                        type="button"
                        onClick={() => setOpenMobileMenu(!openMobileMenu)}
                        className='flex items-center justify-center border border-white/5 p-2 rounded-xl bg-white/[0.02] hover:bg-cyan-500/10 text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer'
                    >
                        <MenuOutlined className="text-lg" />
                    </button>

                    {/* LOGO TRANG WEB */}
                    <Link
                        to="/"
                        onClick={() => navigate('/')}
                        className='flex items-center text-xl hover:opacity-90 font-black tracking-wider transition-opacity mr-2'
                    >
                        <span className='text-cyan-400 font-sans antialiased text-[22px] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]'>XYZ</span>
                        <span className='text-orange-500 font-sans antialiased text-[22px] drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]'>.ee</span>
                    </Link>

                    {/* MENU ĐIỀU HƯỚNG DESKTOP */}
                    <nav className="hidden xl:flex items-center gap-1 font-bold text-[13px] tracking-wide text-gray-300 h-full font-sans">
                        {/* Nút Trang chủ */}
                        <Link to="/" className="relative flex items-center gap-1.5 px-4 h-full text-cyan-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                            <HomeOutlined className="text-[14px]" /> Trang chủ
                        </Link>

                        {/* Nút TẬP HỢP DROPDOWN THỂ LOẠI */}
                        <div className="relative h-full flex items-center after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100" ref={genreDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setOpenGenreDropdown(!openGenreDropdown)}
                                className={`flex items-center gap-1.5 px-4 h-full transition-all duration-300 cursor-pointer border-none bg-transparent font-bold text-[13px] ${openGenreDropdown ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'
                                    }`}
                            >
                                <AppstoreOutlined className="text-[14px]" />
                                <span>Thể Loại</span>
                                {/* Mũi tên tam giác nhỏ lật hướng */}
                                <span className={`text-[9px] transition-transform duration-300 ${openGenreDropdown ? 'rotate-180 text-cyan-400' : 'text-gray-500'}`}>▼</span>
                            </button>

                            {/* DROPDOWN MENU ĐỔ XUỐNG */}
                            {openGenreDropdown && (
                                <div className="absolute left-0 top-[100%] mt-1 w-44 bg-[#14161f]/95 border border-white/5 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Mũi tên đỉnh nhọn hướng lên tab cha */}
                                    <div className="absolute -top-1 left-8 w-2 h-2 bg-[#14161f] border-t border-l border-white/5 rotate-45"></div>

                                    {/* Danh sách thể loại */}
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
                                            className="block px-5 py-2.5 text-[12px] font-semibold text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200 text-left"
                                        >
                                            {genre.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Nút Phim lẻ */}
                        <Link to="/?category=movie-le" className="flex items-center gap-1.5 px-4 h-full text-gray-400 hover:text-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                            <VideoCameraOutlined className="text-[14px]" /> Phim Lẻ
                        </Link>

                        {/* Nút Đang chiếu */}
                        <Link to="/schedule" className="flex items-center gap-1.5 px-4 h-full text-gray-400 hover:text-cyan-400 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-cyan-400 after:shadow-[0_-3px_8px_#22d3ee] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                            <FieldTimeOutlined className="text-[14px]" /> Lịch Chiếu
                        </Link>
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

            <MobileMenu openMobileMenu={openMobileMenu} setOpenMobileMenu={setOpenMobileMenu} />

        </>
    );
};

export default memo(Header);
