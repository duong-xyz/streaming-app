import React, { useEffect, useState } from 'react';
import { 
    EditOutlined, DeleteOutlined, PlusOutlined, 
    EyeOutlined, CalendarOutlined, FolderAddOutlined,
    LoadingOutlined 
} from '@ant-design/icons';
import { message } from 'antd'; // Giữ lại message thông báo hệ thống theo code gốc của bạn
import movieService from '../services/movieService';
import { useNavigate } from 'react-router-dom';

function MovieListManager() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Quản lý phân trang đồng bộ Spring Boot (Backend tính từ 0, Antd Table từ 1)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Quản lý trạng thái đóng/mở Modal và Form của Ant Design
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovieId, setEditingMovieId] = useState(null); // null: Thêm mới | có ID: Sửa phim
    const [submitting, setSubmitting] = useState(false);

    // Khởi tạo các State lưu trữ dữ liệu ô nhập liệu và lỗi Validation thủ công thay cho AntD Form Instance
    const [formData, setFormData] = useState({
        title: '',
        alternativeTitle: '',
        status: '',
        schedule: '',
        thumbnailUrl: '',
        posterUrl: '',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // State quản lý tooltip và popconfirm tự chế theo dòng ID dữ liệu
    const [hoveredTooltip, setHoveredTooltip] = useState({ id: null, type: null });
    const [openPopconfirmId, setOpenPopconfirmId] = useState(null);

    // Theo dõi và cập nhật liên tục các ký tự khi gõ phím vào ô nhập liệu
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };
    // 1. Hàm tải danh sách phim từ Backend (Bóc tách cấu trúc Page)
    const fetchMovies = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const data = await movieService.getAllMovies(page, size);
            console.log(data);

            setMovies(data.content);
            setPagination({
                current: data.page.number + 1,
                pageSize: data.page.size,
                total: data.page.totalElements
            });
        } catch (error) {
            message.error(error.message || "Không thể tải danh sách phim!");
        } finally {
            setLoading(false);
        }
    };

    // Tự động kích hoạt tải dữ liệu khi vừa mở trang quản trị lên
    useEffect(() => {
        fetchMovies(0, pagination.pageSize);
    }, []);

    // Xử lý sự kiện khi Admin bấm nút chuyển trang trên Table
    const handlePageChange = (pageIndex) => {
        fetchMovies(pageIndex, pagination.pageSize);
    };

    // 2. Hàm kích hoạt mở Modal để tạo mới phim (Ứng với MovieCreateForm)
    const handleOpenCreateModal = () => {
        setEditingMovieId(null);
        setFormErrors({});
        setFormData({
            title: '',
            alternativeTitle: '',
            status: '',
            schedule: '',
            thumbnailUrl: '',
            posterUrl: '',
            description: ''
        });
        setIsModalOpen(true);
    };

    // 3. Hàm kích hoạt mở Modal để cập nhật phim (Ứng với MovieUpdateForm)
    const handleOpenEditModal = async (id) => {
        setEditingMovieId(id);
        setFormErrors({});
        try {
            const movieDetail = await movieService.getMovieById(id);

            // Nạp dữ liệu cũ vào Form. 
            // Luu ý đặc biệt: status cần lấy chuỗi .code để ô Select của Antd bắt được option tương ứng
            setFormData({
                title: movieDetail.title || '',
                alternativeTitle: movieDetail.alternativeTitle || '',
                description: movieDetail.description || '',
                thumbnailUrl: movieDetail.thumbnailUrl || '',
                posterUrl: movieDetail.posterUrl || '',
                status: movieDetail.status?.code || '',
                schedule: movieDetail.schedule || '',
            });
            setIsModalOpen(true);
        } catch (error) {
            message.error("Không thể lấy thông tin chi tiết phim!");
        }
    };

    const handleMoveToEpManage = (movieId) => {
        navigate(`/admin/movies/${movieId}/episodes`);
    };
    // Trình kiểm soát lỗi dữ liệu đầu vào (Mô phỏng chính xác quy định rules cũ của Form.Item)
    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Tiêu đề phim không được để trống!';
        } else if (formData.title.length > 255) {
            errors.title = 'Tiêu đề không được vượt quá 255 ký tự!';
        }

        if (formData.alternativeTitle && formData.alternativeTitle.length > 255) {
            errors.alternativeTitle = 'Tên gọi khác không được vượt quá 255 ký tự!';
        }

        if (formData.schedule && formData.schedule.length > 255) {
            errors.schedule = 'Lịch chiếu không được vượt quá 255 ký tự!';
        }

        if (formData.thumbnailUrl && formData.thumbnailUrl.length > 500) {
            errors.thumbnailUrl = 'Link ảnh thu nhỏ không được vượt quá 500 ký tự!';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 4. Hàm xử lý khi nhấn nút Lưu trên Modal (Tự động phân nhánh Create / Update)
    // Hàm xử lý khi nhấn nút Lưu trên Modal (Sửa đổi để gửi ĐÚNG FORMAT Object)
    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            // 1. Tạo một bảng ánh xạ (Mapping) giữa Code và Tên hiển thị Tiếng Việt
            const statusMapping = {
                'COMING_SOON': 'Sắp chiếu',
                'SHOWING': 'Đang chiếu',
                'STOPPED': 'Đã ngừng chiếu' // Giữ nguyên nhãn cũ trong code của bạn
            };

            // 2. CHUẨN HÓA ĐÚNG FORMAT: Biến chuỗi chữ thuần thành một JSON Object
            const formattedValues = {
                title: formData.title,
                alternativeTitle: formData.alternativeTitle,
                description: formData.description,
                thumbnailUrl: formData.thumbnailUrl,
                posterUrl: formData.posterUrl,
                schedule: formData.schedule,
                status: formData.status ? {
                    code: formData.status,                          // Ví dụ: "SHOWING"
                    displayName: statusMapping[formData.status] || '' // Ví dụ: "Đang chiếu"
                } : (editingMovieId ? null : { code: 'COMING_SOON', displayName: 'Sắp chiếu' }) // Fallback thêm mới chuẩn xác
            };

            console.log("Dữ liệu chuẩn định dạng Object gửi lên Backend:", formattedValues);

            if (editingMovieId) {
                // TRUYỀN formattedValues (Đã có status dạng Object) thay vì values gốc
                await movieService.updateMovie(editingMovieId, formattedValues);
                message.success("Cập nhật thông tin phim thành công!");
            } else {
                await movieService.createMovie(formattedValues);
                message.success("Thêm phim mới thành công!");
            }

            setIsModalOpen(false);
            fetchMovies(pagination.current - 1, pagination.pageSize);
        } catch (error) {
            if (error.response) {
                message.error(error.response.data?.message || "Lưu thông tin thất bại!");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // 5. Hàm xử lý gửi yêu cầu xóa phim lên Server
    const handleDelete = async (id) => {
        try {
            await movieService.deleteMovie(id);
            message.success("Xóa bộ phim thành công!");
            fetchMovies(pagination.current - 1, pagination.pageSize);
        } catch (error) {
            message.error("Xóa thất bại! Vui lòng kiểm tra lại quyền.");
        }
    };
    return (
        <div className="flex flex-col gap-5 p-4 bg-slate-50 min-h-screen">
            {/* 1. Khu vực Tiêu đề trang quản lý và Nút thêm mới */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-bold tracking-tight text-slate-800">Quản Lý Phim Hệ Thống</h2>
                    <p className="text-xs text-slate-400">Xem danh sách, thêm mới hoặc cập nhật thông tin phim của hệ thống.</p>
                </div>
                <button
                    type="button"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm h-10 px-4 font-medium rounded-md shadow-sm transition-colors cursor-pointer border-none flex items-center gap-1.5 active:scale-[0.99]"
                    onClick={handleOpenCreateModal}
                >
                    <PlusOutlined />
                    <span>Thêm Phim Mới</span>
                </button>
            </div>

            {/* 2. Bảng hiển thị thông tin phim của Ant Design -> Chuyển sang Table HTML5 Thuần v4 */}
            <div className="shadow-sm border border-slate-200 rounded-lg overflow-hidden bg-white relative">
                
                {/* HIỆU ỨNG LOADING XOAY TRÒN: Xuất hiện khi loading === true */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 transition-all">
                        <LoadingOutlined className="animate-spin text-3xl text-cyan-600" />
                    </div>
                )}

                <div className="w-full overflow-x-auto style-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                                <th className="p-4 w-[70px] text-center">ID</th>
                                <th className="p-4 w-[80px] text-center">Ảnh</th>
                                <th className="p-4">Thông tin phim</th>
                                <th className="p-4 w-[200px]">Lịch chiếu & Trạng thái</th>
                                <th className="p-4 w-[110px]">Lượt xem</th>
                                <th className="p-4 w-[120px] text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {movies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium bg-white select-none">
                                        Không có dữ liệu bộ phim nào trong danh sách.
                                    </td>
                                </tr>
                            ) : (
                                movies.map((record, index) => {
                                    // BÓC TÁCH ENUM OBJECT: Đọc dữ liệu từ @JsonFormat(shape = JsonFormat.Shape.OBJECT)
                                    const statusCode = record.status?.code || 'COMING_SOON';
                                    const statusName = record.status?.displayName || 'Sắp chiếu';

                                    // Phân loại màu sắc Tag dựa trên mã code Enum nhận từ Spring Boot
                                    let tagClass = 'bg-amber-50 text-amber-700 border-amber-200'; // Mặc định màu cam cho COMING_SOON
                                    if (statusCode === 'SHOWING') tagClass = 'bg-blue-50 text-blue-700 border-blue-200'; // Màu xanh dương cho Đang chiếu
                                    if (statusCode === 'STOPPED') tagClass = 'bg-red-50 text-red-700 border-red-200'; // Màu đỏ cho Đã ngừng chiếu

                                    return (
                                        <tr key={`movie-row-${record.id || index}`} className="hover:bg-slate-50/50 transition-colors">
                                            {/* Cột ID */}
                                            <td className="p-4 font-mono text-xs text-slate-500 text-center">{record.id}</td>
                                            
                                            {/* Cột Ảnh: Nếu không có ảnh thu nhỏ, tự động lấy ảnh poster dọc làm ảnh thay thế */}
                                            <td className="p-4 text-center">
                                                <img 
                                                    src={record.thumbnailUrl || record.posterUrl} 
                                                    alt={record.title}
                                                    className="w-12 h-12 rounded-md object-cover border border-slate-200 shadow-xs inline-block"
                                                />
                                            </td>

                                            {/* Cột Thông tin phim */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-slate-800 text-sm line-clamp-1">{record.title}</span>
                                                    {record.alternativeTitle && (
                                                        <span className="text-xs text-slate-400 italic line-clamp-1">Tên khác: {record.alternativeTitle}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Cột Lịch chiếu & Trạng thái */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div>
                                                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border select-none ${tagClass}`}>
                                                            {statusName} {/* Hiển thị trực tiếp chữ tiếng Việt "Đang chiếu", "Sắp chiếu" gửi từ DB */}
                                                        </span>
                                                    </div>
                                                    {record.schedule && (
                                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                                            <CalendarOutlined className="text-slate-400" /> {record.schedule}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Cột Lượt xem */}
                                            <td className="p-4">
                                                <span className="text-slate-600 text-sm font-medium flex items-center gap-1">
                                                    <EyeOutlined className="text-slate-400" /> {record.viewsTotal?.toLocaleString('vi-VN') || 0}
                                                </span>
                                            </td>
                                            {/* Cột Hành động: render cụm Space size="small" lồng Buttons, Tooltips và Popconfirm */}
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap relative">
                                                    
                                                    {/* Tooltip + Nút Quản lý tập phim */}
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMoveToEpManage(record.id)}
                                                            className="inline-flex items-center justify-center bg-white border border-slate-200 text-purple-600 hover:text-cyan-700 hover:border-cyan-700 w-8 h-8 rounded transition-all cursor-pointer"
                                                        >
                                                            <FolderAddOutlined />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-medium text-white bg-slate-800 rounded opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                                                            Quản lý tập phim
                                                        </span>
                                                    </div>

                                                    {/* Tooltip + Nút bấm kích hoạt hàm mở Modal sửa thông tin phim */}
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(record.id)}
                                                            className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-cyan-700 hover:border-cyan-700 w-8 h-8 rounded transition-all cursor-pointer"
                                                        >
                                                            <EditOutlined />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-medium text-white bg-slate-800 rounded opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                                                            Sửa thông tin
                                                        </span>
                                                    </div>

                                                    {/* Tooltip + Nút bấm kích hoạt hộp thoại xác nhận xóa phim */}
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenPopconfirmId(openPopconfirmId === record.id ? null : record.id)}
                                                            className="inline-flex items-center justify-center bg-white border border-slate-200 text-red-500 hover:bg-red-50 w-8 h-8 rounded transition-all cursor-pointer"
                                                        >
                                                            <DeleteOutlined />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-medium text-white bg-slate-800 rounded opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                                                            Xóa phim
                                                        </span>

                                                        {/* HỘP THOẠI POPCONFIRM TỰ CHẾ: Xác nhận xóa bộ phim này? */}
                                                        {openPopconfirmId === record.id && (
                                                            <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50 text-left whitespace-normal animate-in fade-in slide-in-from-bottom-1 duration-150">
                                                                <h5 className="font-bold text-slate-800 text-xs mb-1">Xác nhận xóa bộ phim này?</h5>
                                                                <p className="text-slate-500 text-[11px] leading-normal mb-2">
                                                                    Hành động này sẽ xóa toàn bộ dữ liệu phim.
                                                                </p>
                                                                <div className="flex justify-end gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOpenPopconfirmId(null)}
                                                                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer border-none"
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleDelete(record.id);
                                                                            setOpenPopconfirmId(null);
                                                                        }}
                                                                        className="px-2 py-1 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded transition-colors cursor-pointer border-none shadow-xs"
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* KHỐI PHÂN TRANG (PAGINATION) */}
                {pagination.total > 0 && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-500 select-none">
                        <span>Tổng số: <strong className="font-bold text-slate-800">{pagination.total}</strong> kết quả</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={pagination.current === 1}
                                onClick={() => handlePageChange(pagination.current - 2)}
                                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-bold cursor-pointer transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1.5 bg-cyan-600 text-white rounded font-bold">
                                {pagination.current}
                            </span>
                            <button
                                type="button"
                                disabled={pagination.current * pagination.pageSize >= pagination.total}
                                onClick={() => handlePageChange(pagination.current)}
                                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-bold cursor-pointer transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Component Modal phục vụ song song tính năng Tạo mới & Sửa đổi */}
            {/* 3. Component Modal phục vụ song song tính năng Tạo mới & Sửa đổi */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    {/* Lớp nền mờ (Backdrop overlay) */}
                    <div 
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
                    />
                    
                    {/* Thân hộp thoại Modal (Rộng chuẩn 650px như cấu trúc cũ width={650}) */}
                    <div className="relative bg-white w-full max-w-[650px] rounded-xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[90vh]">
                        <h3 className="border-b border-slate-100 pb-3 mb-4 select-none">
                            <span className="text-lg font-bold text-slate-800">
                                {editingMovieId ? "Cập Nhật Thông Tin Phim" : "Thêm Bộ Phim Mới"}
                            </span>
                        </h3>

                        {/* Vùng Form nhập liệu có hỗ trợ thanh cuộn nếu nội dung quá dài trên Mobile */}
                        <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 style-scrollbar flex-1 pt-1">
                            {/* Trường Title - Đồng bộ với @NotBlank ở Backend */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600 flex items-center gap-0.5">
                                    Tiêu đề phim <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên phim gốc..."
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.title ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.title && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.title}</span>
                                )}
                            </div>

                            {/* Trường AlternativeTitle */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Tên gọi khác (Alternative Title)</label>
                                <input 
                                    type="text"
                                    name="alternativeTitle"
                                    value={formData.alternativeTitle}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Tên tiếng anh, Tên dịch nghĩa..."
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.alternativeTitle ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.alternativeTitle && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.alternativeTitle}</span>
                                )}
                            </div>
                            {/* Logic Ẩn/Hiện ô chọn Status: Chỉ mở ra khi sửa phim (Khớp với cấu trúc MovieUpdateForm) */}
                            {editingMovieId && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Trạng thái phim</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none transition-all cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="COMING_SOON">Sắp chiếu</option>
                                        <option value="SHOWING">Đang chiếu</option>
                                        <option value="STOPPED">Đã ngừng chiếu</option>
                                    </select>
                                </div>
                            )}

                            {/* Trường Schedule */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Lịch chiếu phim</label>
                                <input 
                                    type="text"
                                    name="schedule"
                                    value={formData.schedule}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Tối thứ 7 hàng tuần, 20h mỗi ngày..."
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.schedule ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.schedule && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.schedule}</span>
                                )}
                            </div>

                            {/* Trường ThumbnailUrl - Đồng bộ giới hạn 500 ký tự */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Đường dẫn ảnh thu nhỏ (Thumbnail URL)</label>
                                <input 
                                    type="text"
                                    name="thumbnailUrl"
                                    value={formData.thumbnailUrl}
                                    onChange={handleInputChange}
                                    placeholder="Nhập liên kết ảnh ngang tỉ lệ 16:9..."
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.thumbnailUrl ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.thumbnailUrl && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.thumbnailUrl}</span>
                                )}
                            </div>

                            {/* Trường PosterUrl */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Đường dẫn ảnh Poster (Poster URL)</label>
                                <input 
                                    type="text"
                                    name="posterUrl"
                                    value={formData.posterUrl}
                                    onChange={handleInputChange}
                                    placeholder="Nhập liên kết ảnh dọc tỉ lệ 3:4..."
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            {/* Trường Description - Thích hợp dùng TextArea cho thuộc tính @Lob */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Mô tả tóm tắt nội dung phim</label>
                                <textarea 
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tóm tắt cốt truyện, thông tin đạo diễn, diễn viên chính..."
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none style-scrollbar"
                                />
                            </div>

                            {/* Thanh công cụ nút bấm điều khiển của Modal dưới đáy Form */}
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-5 select-none shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed border-none"
                                >
                                    {submitting && <LoadingOutlined className="animate-spin text-sm" />}
                                    <span>Lưu dữ liệu</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MovieListManager;
