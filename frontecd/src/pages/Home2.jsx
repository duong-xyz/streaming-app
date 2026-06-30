import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import movieService from '../services/movieService';
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import Slider from './generics/Slider';
import ListMovies from './generics/ListMovies';
import Rankings from './generics/Rankings';
import {
    PlayCircleFilled , LeftOutlined, RightOutlined,
    InfoCircleOutlined, EyeOutlined, TrophyOutlined,
} from '@ant-design/icons';

// DỮ LIỆU MẪU ĐÃ ĐỒNG BỘ: Thêm subTitle tiếng Anh tạo bố cục chữ 2 tầng tinh tế
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
    const [activeFilter, setActiveFilter] = useState("3D");

    useEffect(() => {
        let isCurrentRequest = true;
        const fetchHomeData = async () => {
            try {
                setDataState(prev => ({ ...prev, loading: true, isOffline: false }));

                const res = await movieService.getAllMovies(currentPage, pageSize);
                console.log("res:", res);

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

    return (
        <div className='min-h-screen bg-[#0b0c10] text-gray-300 font-sans antialiased selection:bg-cyan-500 selection:text-black'>
            <div className='max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-7'>

                {/* SLIDER PHIM BẢNG XẾP HẠNG 3D SO LE DONGHUA CAO CẤP */}
                <Slider 
                    ref={sliderRef} 
                    dataState={dataState} 
                    navigate={navigate}
                    LeftOutlined={<LeftOutlined />} 
                    PlayCircleFilled ={<PlayCircleFilled className='text-3xl text-yellow-400' />}
                    RightOutlined={<RightOutlined />}        
                />

                {/* KHỐI THÔNG BÁO TINH TẾ (Phong cách lệnh bài tu tiên tỏa hào quang) */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1f2d] via-[#091520] to-[#070e14] border border-cyan-500/10 rounded-xl p-4 flex items-center gap-4.5 shadow-xl shadow-black/30 group select-none">
                    {/* Hiệu ứng tia sáng quét mờ khi di chuột vào thông báo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                    
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-400/20 flex items-center justify-center shrink-0 shadow-inner">
                        <InfoCircleOutlined className='text-cyan-400 text-lg drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]' />
                    </div>
                    
                    <div className='text-xs md:text-sm leading-relaxed flex-1 font-sans tracking-wide'>
                        <span className='text-emerald-400 font-extrabold mr-2 uppercase text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shadow-sm'>
                            Thông Báo
                        </span>
                        <span className='text-gray-400 font-medium'>Địa chỉ tụ họp tu tiên mới:</span>
                        <span className='text-cyan-300 font-black underline mx-2 tracking-wider cursor-pointer hover:text-cyan-400 transition-colors'>
                            XYZHH3D.ch
                        </span>
                        <span className='text-gray-400 font-normal'>
                            • Báo danh tại đây {!isAuthenticated && <span onClick={() => navigate('/login')} className='text-cyan-400 font-black hover:underline cursor-pointer mx-0.5'>Đăng nhập</span>} để ghi nhớ thần thông, lưu lịch sử tu luyện. Chưa nhập môn? <span onClick={() => navigate('/login')} className='text-emerald-400 font-black hover:underline cursor-pointer'>Đăng ký ngay</span>
                        </span>
                    </div>
                </div>

                {/* THÂN TRANG CHIA LÀM 2 CỘT DỌC ĐIỆN ẢNH */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-7 items-start pt-2'>
                    {/* CỘT TRÁI (3/4 KHÔNG GIAN) - LƯỚI DANH SÁCH PHIM MỚI CẬP NHẬT */}
                    <ListMovies 
                        setActiveFilter={setActiveFilter} 
                        dataState={dataState}
                        navigate={navigate} 
                        handlePageChange={handlePageChange}
                        activeFilter={activeFilter} 
                        currentPage={currentPage}
                    />

                    {/* CỘT PHẢI PHỤ (1/4 KHÔNG GIAN) - BẢNG XẾP HẠNG HUY CHƯƠNG VIP TỐI ƯU */}
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
