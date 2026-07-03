import { LeftOutlined, HeartFilled, HistoryOutlined } from '@ant-design/icons'
import { memo } from 'react';
import { Link } from "react-router-dom"

const MobileMenu = ({ openMobileMenu, setOpenMobileMenu }) => {
    return (
        <>
            {/* ================= DRAWER TOÀN MÀN HÌNH ================= */}
            {/* Lớp nền mờ */}
            <div
                onClick={() => setOpenMobileMenu(false)}
                className={`fixed inset-0 bg-black/70 transition-opacity duration-300 ${openMobileMenu ? "z-41 opacity-100 pointer-events-auto" : "z-[-1] opacity-0 pointer-events-none"
                    }`}
            />
            {/* Thân Drawer */}
            <div
                onClick={() => setOpenMobileMenu(false)}
                className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#0f1115]/95 backdrop-blur-md text-white p-5 overflow-y-auto shadow-2xl border-r border-white/5 transition-transform duration-300 ease-out flex flex-col gap-6 font-sans ${openMobileMenu ? "z-60 transform-none" : "z-[-1] -translate-x-full"
                    }`}
            >
                {/* Nút Đóng */}
                <button
                    type="button"
                    className='self-start flex items-center gap-1.5 bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer'
                >
                    <LeftOutlined className='text-[10px]' /> Trở về
                </button>

                {/* KHỐI ĐĂNG KÝ / ĐĂNG NHẬP */}
                <div className='flex items-center justify-between gap-3 font-sans bg-white/[0.01] border border-white/5 p-3 rounded-2xl w-full mt-1'>
                    <Link to="/register" className='text-gray-300 hover:text-cyan-400 font-bold px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all text-xs flex-1 text-center border border-white/5'>
                        Đăng ký
                    </Link>
                    <Link to="/login" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-center text-black hover:brightness-110 font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-xs tracking-wide flex-1">
                        Đăng nhập
                    </Link>
                </div>

                {/* Liên kết nhanh Yêu thích và Lịch sử */}
                <div className="mt-2 grid grid-cols-2 gap-3 text-center border-b border-white/5 pb-5">
                    <Link to="/favorites" className="flex flex-col items-center gap-1.5 group p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/20 transition-all">
                        <HeartFilled className="text-lg text-rose-500 group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(244,63,94,0.3)]" />
                        <span className="text-[11px] text-gray-400 font-bold">Yêu thích</span>
                    </Link>
                    <Link to="/history" className="flex flex-col items-center gap-1.5 group p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/20 transition-all">
                        <HistoryOutlined className="text-lg text-cyan-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]" />
                        <span className="text-[11px] text-gray-400 font-bold">Lịch sử xem</span>
                    </Link>
                </div>
                {/* Danh sách Menu điều hướng chính */}
                <nav className="flex flex-col font-bold text-sm tracking-wide border-b border-white/5 pb-4 gap-1">
                    <Link to="/" className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">Trang chủ</Link>
                    <Link to="/schedule" className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">Lịch Chiếu Phim</Link>
                    <Link to="/?filter=new" className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">Mới Cập Nhật</Link>
                    <Link to="/?filter=top" className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">Top Xem Nhiều</Link>
                    <Link to="/?filter=completed" className="text-gray-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">Phim Đã Hoàn Thành</Link>
                </nav>

                {/* Khối danh mục lựa chọn Thể Loại */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-3">Thể loại</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold px-1">
                        <Link to="/?genre=tu-tien" className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-center hover:bg-emerald-500/10 transition-all">Tu Tiên</Link>
                        <Link to="/?genre=hien-dai" className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-400 text-center hover:bg-amber-500/10 transition-all">Hiện Đại</Link>

                        <Link to="/?genre=kiem-hiep" className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-400 text-center hover:bg-rose-500/10 transition-all">Kiếm Hiệp</Link>
                        <Link to="/?genre=co-trang" className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/10 text-purple-400 text-center hover:bg-purple-500/10 transition-all">Cổ Trang</Link>

                        <Link to="/?genre=do-thi" className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-400 text-center hover:bg-blue-500/10 transition-all">Đô Thị</Link>
                        <Link to="/?genre=trung-sing" className="p-2 rounded-lg bg-fuchsia-500/5 border border-fuchsia-500/10 text-fuchsia-400 text-center hover:bg-fuchsia-500/10 transition-all">Trùng Sinh</Link>

                        <Link to="/?genre=hai-huoc" className="p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 text-center hover:bg-yellow-500/10 transition-all col-span-2">Hài Hước</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(MobileMenu);