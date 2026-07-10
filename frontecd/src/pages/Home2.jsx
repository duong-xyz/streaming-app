import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import movieService from '../services/movieService';
import { useCallback, useEffect, useRef, useState, memo, useMemo } from 'react';
import Slider from './generics/Slider';
import ListMovies from './generics/ListMovies';
import Rankings from './generics/Rankings';
import {
    PlayCircleFilled, LeftOutlined, RightOutlined,
    InfoCircleOutlined, EyeOutlined, TrophyOutlined,
} from '@ant-design/icons';
import HomeScheduleBar from '../components/HomeScheduleBar';

const MOCK_MOVIES = [
    { id: 1, title: "Phàm Nhân Tu Tiên Phần 3", subTitle: "A Mortal's Journey to Immortality 3", latestEpisode: 158, status: "Đang chiếu", schedule: "Tối T3", viewsTotal: 158200, posterUrl: "https://hoathinh3d.co/wp-content/uploads/2026/06/pham-nhan-tu-tien-phan-3-thumb-300x450.jpg", thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2026/06/pham-nhan-tu-tien-phan-3-thumb-300x450.jpg" },
    { id: 2, title: "Tiên Nghịch", subTitle: "Renegade Immortal", latestEpisode: 146, status: "Đang chiếu", schedule: "Tối T7", viewsTotal: 146180, posterUrl: "https://hoathinh3d.co/wp-content/uploads/2023/09/tien-nghich-6-300x450.jpg", thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2023/09/tien-nghich-6-300x450.jpg" },
    { id: 3, title: "Quang Âm Chi Ngoại", subTitle: "Beyond Time's Gaze", latestEpisode: 27, status: "Sắp chiếu", schedule: "Tối T6", viewsTotal: 84100, posterUrl: "https://hoathinh3d.co/wp-content/uploads/2022/06/dau-pha-thuong-khung-300x450.webp", thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2022/06/dau-pha-thuong-khung-300x450.webp" },
    { id: 4, title: "Mục Thần Ký", subTitle: "Tales of Herding Gods", latestEpisode: 23, status: "Hoàn thành", schedule: "Tối T4", viewsTotal: 72000, posterUrl: "https://hoathinh3d.co/wp-content/uploads/2024/10/muc-than-ky-300x450.webp", thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2024/10/muc-than-ky-300x450.webp" },
    { id: 5, title: "Đấu Phá Thương Khung Phần 5", subTitle: "Battle Through the Heavens 5", latestEpisode: 204, status: "Đang chiếu", schedule: "Tối CN", viewsTotal: 204209, posterUrl: "https://hoathinh3d.co/wp-content/uploads/2024/10/muc-than-ky-300x450.webp", thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2024/10/muc-than-ky-300x450.webp" },
    { id: 6, title: "Già Thiên", subTitle: "Shrouding the Heavens", latestEpisode: 168, status: "Đang chiếu", schedule: "Tối T3", viewsTotal: 65000, posterUrl: "https://hoathinh3d.co/wp-content/uploads/2024/10/muc-than-ky-300x450.webp", thumbnailUrl: "https://hoathinh3d.co/wp-content/uploads/2024/10/muc-than-ky-300x450.webp" }
];
const pageSize = 12;

const Home2 = () => {
    const navigate = useNavigate();
    const sliderRef = useRef(null);

    const authState = useSelector(state => state.auth);
    const isAuthenticated = authState?.isAuthenticated || false;

    const [dataState, setDataState] = useState({
        movies: [],
        topMovies: [],
        totalPages: 1,
        loading: true,
        isOffline: false
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [scheduleDay, setScheduleDay] = useState('LATEST');

    useEffect(() => {
        let isCurrentRequest = true;
        const fetchHomeData = async () => {
            try {
                setDataState(prev => ({ ...prev, loading: true, isOffline: false }));

                const res = await movieService.getAllMovies(currentPage, pageSize);
                console.log(res);
                

                if (!isCurrentRequest) return;

                if (res && res.content && Array.isArray(res.content) && res.content.length > 0) {
                    const sortedByViews = [...res.content]
                        .sort((a, b) => (Number(b?.viewsTotal) || 0) - (Number(a?.viewsTotal) || 0))
                        .slice(0, 6); // Đổi thành lấy 6 phim cho đồng bộ slider
                    setDataState(prev => ({
                        ...prev,
                        movies: res.content,
                        topMovies: sortedByViews,
                        totalPages: res?.page?.totalPages || 0,
                        isOffline: false
                    }));
                } else {
                    setDataState(prev => ({
                        ...prev,
                        movies: MOCK_MOVIES || [],
                        topMovies: MOCK_MOVIES,
                        totalPages: 1,
                        isOffline: true
                    }));
                }
            } catch (err) {
                if (!isCurrentRequest) return;
                console.error("Lỗi xảy ra khi fetch api tại tầng giao diện home:", err);
                setDataState(prev => ({
                    ...prev,
                    movies: MOCK_MOVIES || [],
                    topMovies: MOCK_MOVIES,
                    totalPages: 1,
                    isOffline: true
                }));
            } finally {
                if (isCurrentRequest) {
                    setDataState(prev => ({ ...prev, loading: false }));
                }
            }
        };
        fetchHomeData();
        return () => {
            isCurrentRequest = false;
        }
    }, [currentPage]);
    // KHÓA CỨNG PHÂN TRANG: Đưa biến totalPages vào danh sách phụ thuộc để tối ưu bộ nhớ React
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 0 && newPage < dataState.totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 400, behavior: "smooth" });
        }
    }, [dataState.totalPages]);

    // BỘ TÍCH HỢP TÍNH TOÁN LỌC BITMASK EXPERT/Derived State technique
    const pagedAndFilteredDataState = useMemo(() => {
        // Nếu chọn tab Mới Cập Nhật, giữ nguyên dataState gốc phân trang từ Backend
        if (scheduleDay === 'LATEST') {
            return dataState;
        }

        // Bản đồ mã hóa Bitmask đồng bộ 100% với cấu trúc Backend
        const bitMap = { 'MON': 1, 'TUE': 2, 'WED': 4, 'THU': 8, 'FRI': 16, 'SAT': 32, 'SUN': 64 };
        const targetBit = bitMap[scheduleDay] || 0;

        // Quét mảng movies hiện tại trên RAM bằng toán tử Bitwise AND (&)
        const pagedFilteredList = dataState.movies.filter(movie => {
            if (!movie.schedule || !movie.schedule.includes('|')) return false;
            const parts = movie.schedule.split('|');
            if (parts.length < 3) return false;

            const normalBitmask = parseInt(parts[1]) || 0;
            const earlyBitmask = parseInt(parts[2]) || 0;

            // Giữ lại phim nếu thuộc diện chiếu thường HOẶC chiếu sớm của thứ đó
            return (normalBitmask & targetBit) !== 0 || (earlyBitmask & targetBit) !== 0;
        });

        // Đóng gói mảng đã lọc vào Object giả lập cấu trúc giống hệt dataState gốc
        return {
            ...dataState,
            movies: pagedFilteredList
        };
    }, [scheduleDay, dataState]);


    // ==================== BẮT ĐẦU PHẦN 1/2 ====================
    return (
        /* EXPERT UPDATE: Ép cứng màu nền đen mực sẫm tuyệt đối #0c0818 của biến gốc hoathinh3d */
        <div className='min-h-screen bg-[#0c0818] text-[#c4b896] font-sans antialiased selection:bg-[#00aae0] selection:text-[#0c0818]'>
            <div className='max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-7'>

                {/* SLIDER PHIM: Đọc mảng dataState gốc, đã được đóng băng bằng React.memo */}
                <Slider
                    ref={sliderRef}
                    dataState={dataState}
                    navigate={navigate}
                    LeftOutlined={<LeftOutlined />}
                    PlayCircleFilled={<PlayCircleFilled className='text-3xl text-[#e8c872] drop-shadow-[0_0_8px_rgba(232,200,114,0.4)]' />}
                    RightOutlined={<RightOutlined />}
                />

                {/* KHỐI THÔNG BÁO TINH TẾ: Đập bỏ màu xám lạnh, chuyển sang màu nền panel sẫm mờ bọc viền vàng nhạt chuẩn Halim */}
                <div className="relative overflow-hidden bg-[rgba(14,10,28,0.85)] border border-[rgba(232,200,114,0.12)] rounded-xl p-4 flex items-center gap-4.5 shadow-2xl group select-none backdrop-blur-md">
                    {/* Hiệu ứng tia sáng quét mờ màu xanh Cyan phát quang khi di chuột vào thông báo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00aae0]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Hộp icon thông báo bọc viền phát xạ xanh Cyan sáng mượt mà */}
                    <div className="w-10 h-10 rounded-xl bg-[rgba(0,170,224,0.05)] border border-[rgba(0,170,224,0.2)] flex items-center justify-center shrink-0 shadow-inner">
                        <InfoCircleOutlined className='text-[#00aae0] text-lg drop-shadow-[0_0_6px_rgba(0,170,224,0.4)]' />
                    </div>

                    {/* Nội dung thông báo chuyển đổi sang hệ font chữ hoathinh3d */}
                    <div className='text-xs md:text-sm leading-relaxed flex-1 font-sans tracking-wide text-[#c4b896]'>
                        <span className='text-[#5ec4a0] font-black mr-2 uppercase text-[11px] bg-[rgba(94,196,160,0.1)] border border-[rgba(94,196,160,0.2)] px-2 py-0.5 rounded shadow-sm'>
                            Thông Báo
                        </span>
                        <span className='text-[#f0e4c8] font-medium opacity-90'>
                            • Báo danh tại đây {!isAuthenticated && <span onClick={() => navigate('/login')} className='text-[#00aae0] font-black hover:underline cursor-pointer mx-0.5'>Đăng nhập</span>} để bình luận, lưu lịch xem phim. Chưa có tài khoản? <span onClick={() => navigate('/login')} className='text-[#5ec4a0] font-black hover:underline cursor-pointer'>Đăng ký ngay</span>
                        </span>
                    </div>
                </div>
                {/* THANH BAR LỊCH CHIẾU TRÊN HOME: Nhận hàm callback xử lý gán Key Thứ */}
                <HomeScheduleBar onTabChange={(dayKey) => setScheduleDay(dayKey)} />

                {/* THÂN TRANG CHIA LÀM 2 CỘT DỌC ĐIỆN ẢNH HỢP NHẤT TỶ LỆ VÀNG HALIM */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-7 items-start pt-2'>
                    
                    {/* CỘT TRÁI (3/4 KHÔNG GIAN) - LƯỚI DANH SÁCH PHIM MỚI CẬP NHẬT TRANG CHỦ */}
                    <ListMovies
                        dataState={pagedAndFilteredDataState}
                        navigate={navigate}
                        handlePageChange={handlePageChange}
                        currentPage={currentPage}
                    />

                    {/* CỘT PHẢI PHỤ (1/4 KHÔNG GIAN) - BẢNG XẾP HẠNG HUY CHƯƠNG VIP TỐI ƯU CỐ ĐỊNH TOP PHIM */}
                    <Rankings
                        dataState={dataState}
                        navigate={navigate}
                        TrophyOutlined={TrophyOutlined}
                        EyeOutlined={EyeOutlined}
                    />
                </div>

            </div>
        </div>
    );
};

export default memo(Home2);
