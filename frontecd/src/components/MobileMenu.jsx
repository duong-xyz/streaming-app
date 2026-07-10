import React, { memo } from 'react';
import { Link } from "react-router-dom";
import { 
    LeftOutlined, HeartFilled, HistoryOutlined, 
    HomeOutlined, CalendarOutlined, ClockCircleOutlined,
    UserOutlined, UserAddOutlined, AppstoreOutlined
} from '@ant-design/icons';

const MobileMenu = ({ openMobileMenu, setOpenMobileMenu }) => {
    return (
        <>
            {/* LỚP NỀN MỜ PHỦ KÍNH (Mã màu gốc Halim kết hợp hiệu ứng sương mờ 4px) */}
            <div
                onClick={() => setOpenMobileMenu(false)}
                className={`fixed inset-0 backdrop-blur-[4px] transition-opacity duration-300 ${
                    openMobileMenu ? "z-[9999] opacity-100 pointer-events-auto bg-black/65" : "z-[-1] opacity-0 pointer-events-none"
                }`}
            />

            {/* THÂN DRAWER CHUẨN MENU SIDEBAR HALIM THEMES (Màu nền --lc-ink đặc nguyên bản) */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#0c0818] border-r border-[rgba(232,200,114,0.12)] p-5 overflow-y-auto shadow-[5px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out flex flex-col gap-5 font-sans ${
                    openMobileMenu ? "z-[10000] transform-none" : "z-[-1] -translate-x-full"
                }`}
                style={{ fontFamily: "'Be Vietnam Pro', 'Montserrat', sans-serif" }}
            >
                {/* THANH ĐẦU DRAWER: NÚT TRỞ VỀ */}
                <button
                    type="button"
                    onClick={() => setOpenMobileMenu(false)}
                    className="self-start flex items-center gap-2 bg-[rgba(232,200,114,0.05)] border border-[rgba(232,200,114,0.15)] hover:border-[#5ec4a0]/40 text-[#c4b896] hover:text-[#5ec4a0] text-[11px] font-bold px-3.5 py-2 rounded transition-all cursor-pointer outline-none"
                >
                    <LeftOutlined className="text-[10px]" />
                    <span>Trở về</span>
                </button>

                {/* KHỐI ĐĂNG NHẬP / ĐĂNG KÝ (Layout tối giản theo phong vị thanh lịch của Halim) */}
                <div className="flex flex-col gap-2 bg-[rgba(14,10,28,0.6)] border border-[rgba(232,200,114,0.08)] p-3 rounded-lg shadow-inner">
                    <Link 
                        to="/login" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#007ba6] to-[#00aae0] text-white font-black py-2 rounded text-xs tracking-wider uppercase shadow-[0_4px_12px_rgba(0,170,224,0.2)] hover:brightness-110 transition-all border-none"
                    >
                        <UserOutlined className="text-sm" />
                        <span>Đăng Nhập</span>
                    </Link>
                    <Link 
                        to="/register" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="flex items-center justify-center gap-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(232,200,114,0.12)] text-[#c4b896] hover:text-[#f0e4c8] hover:border-[#5ec4a0]/40 font-bold py-2 rounded text-xs tracking-wide transition-all"
                    >
                        <UserAddOutlined className="text-sm text-[#e8c872]" />
                        <span>Tạo Tài Khoản</span>
                    </Link>
                </div>

                {/* LIÊN KẾT NHANH TÁC VỤ (Phân tách mỏng chuẩn Halim block) */}
                <div className="grid grid-cols-2 gap-2 border-b border-[rgba(232,200,114,0.08)] pb-4 select-none">
                    <Link 
                        to="/favorites" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="flex items-center justify-center gap-2 p-2.5 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.06)] hover:border-[#5ec4a0]/30 transition-all group"
                    >
                        <HeartFilled className="text-xs text-[#c45c5c] group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] text-[#c4b896] group-hover:text-[#f0e4c8] font-bold">Yêu thích</span>
                    </Link>
                    <Link 
                        to="/history" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="flex items-center justify-center gap-2 p-2.5 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.06)] hover:border-[#5ec4a0]/30 transition-all group"
                    >
                        <HistoryOutlined className="text-xs text-[#5ec4a0] group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] text-[#c4b896] group-hover:text-[#f0e4c8] font-bold">Lịch sử</span>
                    </Link>
                </div>
                {/* DANH SÁCH MENU ĐIỀU HƯỚNG CHÍNH (Layout dọc mỏng chuẩn HalimThemes) */}
                <nav className="flex flex-col font-bold text-xs tracking-wider border-b border-[rgba(232,200,114,0.08)] pb-4 gap-0.5 select-none">
                    <Link 
                        to="/" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="text-[#c4b896] hover:text-[#5ec4a0] px-3 py-2.5 rounded hover:bg-[rgba(94,196,160,0.04)] transition-all flex items-center gap-2.5 border border-transparent hover:border-[rgba(94,196,160,0.1)]"
                    >
                        <HomeOutlined className="text-[13px] text-[#e8c872]" />
                        <span>Trang Chủ</span>
                    </Link>
                    <Link 
                        to="/schedule" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="text-[#c4b896] hover:text-[#5ec4a0] px-3 py-2.5 rounded hover:bg-[rgba(94,196,160,0.04)] transition-all flex items-center gap-2.5 border border-transparent hover:border-[rgba(94,196,160,0.1)]"
                    >
                        <CalendarOutlined className="text-[13px] text-[#e8c872]" />
                        <span>Lịch Chiếu Phim</span>
                    </Link>
                    <Link 
                        to="/?filter=new" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="text-[#c4b896] hover:text-[#5ec4a0] px-3 py-2.5 rounded hover:bg-[rgba(94,196,160,0.04)] transition-all flex items-center gap-2.5 border border-transparent hover:border-[rgba(94,196,160,0.1)]"
                    >
                        <ClockCircleOutlined className="text-[13px] text-[#e8c872]" />
                        <span>Mới Cập Nhật</span>
                    </Link>
                    <Link 
                        to="/?filter=top" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="text-[#c4b896] hover:text-[#5ec4a0] px-3 py-2.5 rounded hover:bg-[rgba(94,196,160,0.04)] transition-all flex items-center gap-2.5 border border-transparent hover:border-[rgba(94,196,160,0.1)]"
                    >
                        <ClockCircleOutlined className="text-[13px] text-[#e8c872]" />
                        <span>Top Xem Nhiều</span>
                    </Link>
                    <Link 
                        to="/?filter=completed" 
                        onClick={() => setOpenMobileMenu(false)}
                        className="text-[#c4b896] hover:text-[#5ec4a0] px-3 py-2.5 rounded hover:bg-[rgba(94,196,160,0.04)] transition-all flex items-center gap-2.5 border border-transparent hover:border-[rgba(94,196,160,0.1)]"
                    >
                        <ClockCircleOutlined className="text-[13px] text-[#e8c872]" />
                        <span>Phim Đã Hoàn Thành</span>
                    </Link>
                </nav>

                {/* KHỐI DANH MỤC LỰA CHỌN THỂ LOẠI (Hệ lưới đối xứng, đổi màu Ngọc Bích mờ khi hover) */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 pl-3">
                        <AppstoreOutlined className="text-[11px] text-[#e8c872]" />
                        <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest m-0">Thể loại</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold px-1 select-none">
                        <Link 
                            to="/?genre=tu-tien" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all"
                        >
                            Tu Tiên
                        </Link>
                        <Link 
                            to="/?genre=hien-dai" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all"
                        >
                            Hiện Đại
                        </Link>
                        <Link 
                            to="/?genre=kiem-hiep" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all"
                        >
                            Kiếm Hiệp
                        </Link>
                        <Link 
                            to="/?genre=co-trang" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all"
                        >
                            Cổ Trang
                        </Link>
                        <Link 
                            to="/?genre=do-thi" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all"
                        >
                            Đô Thị
                        </Link>
                        <Link 
                            to="/?genre=trung-sing" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all"
                        >
                            Trùng Sinh
                        </Link>
                        <Link 
                            to="/?genre=hai-huoc" 
                            onClick={() => setOpenMobileMenu(false)}
                            className="p-2 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(232,200,114,0.08)] text-[#c4b896] text-center hover:text-[#5ec4a0] hover:border-[#5ec4a0]/30 hover:bg-[rgba(94,196,160,0.05)] transition-all col-span-2"
                        >
                            Hài Hước
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
};

export default memo(MobileMenu);
