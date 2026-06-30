import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import movieService from '../services/movieService';
import { 
  PlayCircleOutlined, 
  LeftOutlined, 
  RightOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';

// Khôi phục dữ liệu khớp 100% tên phim và số tập từ ảnh thực tế bạn gửi
const MOCK_MOVIES = [
  { id: 1, title: "Đấu La Đại Lục 2 - Tuyệt Thế Đường Môn", status: "158/182 [4K]", schedule: "Tối T3", viewsTotal: 158200, posterUrl: "https://unsplash.com", thumbnailUrl: "https://unsplash.com" },
  { id: 2, title: "Tiên Nghịch", status: "146/180 [4K]", schedule: "Tối T7", viewsTotal: 146180, posterUrl: "https://unsplash.com", thumbnailUrl: "https://unsplash.com" },
  { id: 3, title: "Quang Âm Chi Ngoại", status: "27/... [4K]", schedule: "Tối T6", viewsTotal: 84100, posterUrl: "https://unsplash.com", thumbnailUrl: "https://unsplash.com" },
  { id: 4, title: "Trạch Thiên Ký", status: "23/26 [4K]", schedule: "Tối T4", viewsTotal: 72000, posterUrl: "https://unsplash.com", thumbnailUrl: "https://unsplash.com" },
  { id: 5, title: "Đấu Phá Thương Khung Phần 5-6", status: "204/209 [4K]", schedule: "Tối CN", viewsTotal: 204209, posterUrl: "https://unsplash.com", thumbnailUrl: "https://unsplash.com" },
  { id: 6, title: "Già Thiên", status: "Trailer 168/208 Tối T3", schedule: "Tối T3", viewsTotal: 65000, posterUrl: "https://unsplash.com", thumbnailUrl: "https://unsplash.com" }
];
const Home = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null); // Tạo điều khiển liên kết thanh trượt ngang Slider
  
  // Đọc trạng thái đăng nhập an toàn từ auth slice bằng toán tử dấu chấm hỏi (?)
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;

  // Khởi tạo các mảng dữ liệu mặc định rỗng chống lỗi sập màn hình (.map)
  const [movies, setMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false); 
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12; // Số lượng phim hiển thị lưới Grid phía dưới
  const [activeFilter, setActiveFilter] = useState('3D');
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setIsOffline(false);
        
        const response = await movieService.getAllMovies(currentPage, pageSize);
        
        // Điều phối dữ liệu an toàn, kiểm tra mảng kỹ lưỡng trước khi đọc thuộc tính
        if (response && response.data && response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
          // KỊCH BẢN ONLINE: Kết nối Spring Boot thành công
          setMovies(response.data.content); 
          setTotalPages(response.data.totalPages || 0);
          
          const sortedByViews = [...response.data.content]
            .sort((a, b) => (Number(b?.viewsTotal) || 0) - (Number(a?.viewsTotal) || 0))
            .slice(0, 5);
          setTopMovies(sortedByViews);
        } else {
          // KỊCH BẢN OFFLINE: Kích hoạt tự động khi tắt Backend nhờ Interceptor bọc lót
          setIsOffline(true);
          setMovies(MOCK_MOVIES);
          setTopMovies(MOCK_MOVIES.slice(0, 5));
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Lỗi biên dịch bất ngờ tầng giao diện trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' }); // Cuộn mượt xuống lưới phim chính
    }
  };
  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-300 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* ================= 1. CAROUSEL/SLIDER PHIM NỔI BẬT ĐỈNH TRANG (KÍCH HOẠT CHẠY TRƯỢT) ================= */}
        <div className="relative group border-b border-gray-900 pb-4">
          
          {/* NÚT BẤM DI CHUYỂN SLIDE SANG TRÁI */}
          <button 
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black border border-gray-800"
          >
            <LeftOutlined />
          </button>
          
          {/* THANH TRƯỢT CHỨA DANH SÁCH POSTER PHIM (Sử dụng overflow-x-auto và flex-nowrap) */}
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto flex-nowrap scroll-smooth snap-x pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Ẩn thanh cuộn mặc định của trình duyệt
          >
            {Array.isArray(movies) && movies.map((movie) => (
              <div 
                key={`slider-item-${movie?.id || Math.random()}`}
                onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                className="w-[160px] sm:w-[200px] md:w-[220px] shrink-0 bg-[#1a1c23] rounded-lg overflow-hidden cursor-pointer shadow-lg transform hover:scale-102 transition-all duration-300 group/item snap-start"
              >
                <div className="relative aspect-[2/3] w-full bg-gray-900">
                  <img 
                    src={movie?.posterUrl || 'https://unsplash.com'} 
                    alt={movie?.title || 'Movie'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* TAG SỐ TẬP: Tự động check và bốc displayName ra nếu dữ liệu đổ về từ Backend là một Object Enum */}
                  <span className="absolute top-2 left-2 bg-orange-600/90 text-white font-semibold text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10">
                    {typeof movie?.status === 'object' 
                      ? (movie.status.displayName || movie.status.code || 'ONGOING') 
                      : (movie?.status || `Tập ${movie?.schedule || 'Mới'}`)}
                  </span>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <PlayCircleOutlined className="text-4xl text-cyan-400" />
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-t from-black to-[#14161d]">
                  <h3 className="text-xs font-bold text-gray-200 truncate group-hover/item:text-cyan-400 transition-colors" title={movie?.title || ''}>
                    {movie?.title || 'Chưa cập nhật tên'}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* NÚT BẤM DI CHUYỂN SLIDE SANG PHẢI */}
          <button 
            onClick={() => {
              if (sliderRef.current) {
                sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black border border-gray-800"
          >
            <RightOutlined />
          </button>
        </div>
        {/* ================= 2. KHUNG THÔNG BÁO TÊN MIỀN VÀ ĐĂNG NHẬP (MÀU XANH RÊU TỐI) ================= */}
        <div className="bg-[#0e2423] border border-cyan-900/40 rounded-lg p-3.5 flex items-center gap-3 shadow-md">
          <InfoCircleOutlined className="text-xl text-cyan-400 shrink-0" />
          <div className="text-xs md:text-sm leading-relaxed">
            <span className="text-emerald-400 font-bold mr-2">Thông Báo Tên Miền Mới:</span>
            <span className="text-cyan-300 font-semibold underline mr-3">YanHH3D.ch</span>
            <span className="text-gray-400">
              Báo danh tại đây {!isAuthenticated && <span onClick={() => navigate('/login')} className="text-cyan-400 font-bold hover:underline cursor-pointer">Đăng nhập</span>} để sử dụng các chức năng nâng cao. Chưa nhập môn? <span onClick={() => navigate('/login')} className="text-emerald-400 font-bold hover:underline cursor-pointer">Đăng ký ngay</span>
            </span>
          </div>
        </div>

        {/* ================= 3. KHU VỰC THÂN TRANG CHIA 2 CỘT DỌC LỚN ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* CỘT TRÁI CHÍNH (3/4 KHÔNG GIAN) - LƯỚI DANH SÁCH PHIM MỚI CẬP NHẬT */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-4">
                <h2 className="text-sm md:text-base font-bold text-cyan-400 border-l-4 border-cyan-400 pl-2 uppercase tracking-wide">
                  Mới Cập Nhật
                </h2>
                <div className="flex gap-1.5 text-[11px]">
                  {['3D', '2D', '4K', 'Lịch phim'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2 py-0.5 rounded transition-all font-medium ${
                        activeFilter === filter ? 'bg-cyan-500 text-black font-semibold shadow' : 'bg-[#1a1c23] text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isOffline && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg justify-center shadow text-xs font-medium animate-pulse">
                <ExclamationCircleOutlined /> Hệ thống tự động kích hoạt Chế độ hiển thị ngoại tuyến Offline Mode do Server bảo trì.
              </div>
            )}

            {/* KHUNG XƯƠNG LOADING SKELETON KHI ĐANG TẢI DỮ LIỆU LƯỚI PHIM CHÍNH */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, idx) => (
                  <div key={`skeleton-movie-${idx}`} className="space-y-3 animate-pulse">
                    <div className="bg-slate-800/40 aspect-[2/3] rounded-lg w-full"></div>
                    <div className="h-3.5 bg-slate-800/60 rounded w-3/4"></div>
                    <div className="h-2.5 bg-slate-800/30 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* HIỂN THỊ LƯỚI PHIM THẬT KHI ĐÃ TẢI XONG (LOADING = FALSE) */}
            {!loading && Array.isArray(movies) && movies.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {movies.map((movie) => (
                  <div
                    key={movie?.id || Math.random()}
                    onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                    className="group relative bg-[#12141c] rounded-lg border border-gray-900 overflow-hidden cursor-pointer hover:shadow-cyan-500/5 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                      <img
                        src={movie?.posterUrl || 'https://unsplash.com'}
                        alt={movie?.title || 'Movie'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      {/* DẢI NHÃN MỜ POSTER: Đọc an toàn trường displayName từ Object Enum Java nếu Backend bật */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                        <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider block truncate">
                          {typeof movie?.status === 'object' 
                            ? (movie.status.displayName || movie.status.code || '4K CHẤT LƯỢNG CAO') 
                            : (movie?.status || '4K CHẤT LƯỢNG CAO')}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlayCircleOutlined className="text-4xl text-cyan-400" />
                      </div>
                    </div>

                    <div className="p-2.5 space-y-0.5">
                      <h3 className="font-semibold text-xs text-gray-200 group-hover:text-cyan-400 transition-colors truncate" title={movie?.title || ''}>
                        {movie?.title || 'Chưa có tên'}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span className="truncate max-w-[100px]">📅 {movie?.schedule || 'Hàng tuần'}</span>
                        <span><EyeOutlined /> {movie?.viewsTotal ? Number(movie.viewsTotal).toLocaleString() : 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* THANH PHÂN TRANG */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-900 text-xs">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 rounded bg-[#1a1c23] text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <LeftOutlined />
                </button>
                <span className="text-gray-400">
                  Trang <strong className="text-cyan-400">{currentPage + 1}</strong> / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded bg-[#1a1c23] text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <RightOutlined />
                </button>
              </div>
            )}
          </div>
          {/* ================= CỘT PHẢI PHỤ (1/4 KHÔNG GIAN) - BẢNG XẾP HẠNG PHIM ================= */}
          <div className="space-y-4">
            <div className="border-b border-gray-800 pb-2">
              <h2 className="text-sm md:text-base font-bold text-cyan-400 border-l-4 border-cyan-400 pl-2 uppercase tracking-wide flex items-center gap-1.5">
                <TrophyOutlined className="text-amber-500" /> Bảng Xếp Hạng
              </h2>
            </div>

            <div className="bg-[#12141c] border border-gray-900 rounded-lg p-3 space-y-3.5 shadow">
              
              {/* KHUNG XƯƠNG DỌC KHI ĐANG TẢI BẢNG XẾP HẠNG */}
              {loading && (
                <div className="space-y-4 animate-pulse">
                  {[...Array(5)].map((_, idx) => (
                    <div key={`skeleton-rank-${idx}`} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-800/60 rounded shrink-0"></div>
                      <div className="w-9 h-12 bg-slate-800/40 rounded shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-800/60 rounded w-5/6"></div>
                        <div className="h-2 bg-slate-800/30 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HIỂN THỊ DỮ LIỆU BXH THẬT KHI ĐÃ TẢI XONG (LOADING = FALSE) */}
              {!loading && Array.isArray(topMovies) && topMovies.map((movie, index) => (
                <div
                  key={`bxh-${movie?.id || index}`}
                  onClick={() => movie?.id && navigate(`/watch/${movie.id}`)}
                  className="flex items-center gap-3 cursor-pointer group/bxh pb-2 border-b border-gray-900/60 last:border-none last:pb-0"
                >
                  {/* Huy hiệu thứ hạng (Top 1 bôi màu xanh Cyan rực rỡ) */}
                  <div className={`w-6 h-6 rounded flex items-center justify-center font-black text-xs shrink-0 ${
                    index === 0 ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>

                  <img
                    src={movie?.thumbnailUrl || movie?.posterUrl || 'https://unsplash.com'}
                    alt={movie?.title || 'Movie'}
                    className="w-9 h-12 object-cover rounded bg-gray-950 shrink-0 border border-gray-800"
                  />

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs font-bold text-gray-300 group-hover/bxh:text-cyan-400 transition-colors truncate" title={movie?.title || ''}>
                      {movie?.title || 'Chưa cập nhật'}
                    </h4>
                    {/* TRẠNG THÁI PHỤ BXH: Check và bốc chuẩn chữ từ Enum Object */}
                    <p className="text-[10px] text-gray-500 font-light truncate">
                      {typeof movie?.status === 'object' 
                        ? (movie.status.displayName || movie.status.code || 'Hoạt hình 3D') 
                        : (movie?.status || 'Hoạt hình 3D')}
                    </p>
                    <p className="text-[10px] text-orange-400 font-medium">
                      👁 {movie?.viewsTotal ? Number(movie.viewsTotal).toLocaleString() : 0} lượt xem
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div> {/* Đóng thẻ lưới grid chia 4 cột */}
      </div> {/* Đóng thẻ bọc container giới hạn chiều rộng trang */}
    </div>
  );
};

export default Home;
