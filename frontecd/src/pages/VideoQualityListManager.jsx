import { useEffect, useState } from "react";
import { 
    EditOutlined, DeleteOutlined, PlusOutlined, 
    ArrowLeftOutlined, LoadingOutlined 
} from '@ant-design/icons';
import { message } from 'antd'; // Giữ lại message thông báo hệ thống theo code gốc
import { useParams, useNavigate } from 'react-router-dom';
import videoQualityService from '../services/videoQualityService';

const VideoQualityListManager = () => {
    const { movieId, episodeId } = useParams();
    const navigate = useNavigate();

    // 1. Quản lý trạng thái danh sách hiển thị trên Table
    const [listState, setListState] = useState({
        data: [],
        loading: true,
        pagination: { current: 1, pageSize: 10, total: 0 }
    });

    // 2. Quản lý trạng thái đóng/mở và xử lý của Modal Form
    const [modalState, setModalState] = useState({
        isOpen: false,
        editingRecord: null, // null = Thêm mới, có object = Sửa
        submitting: false
    });

    // Khởi tạo các State lưu trữ dữ liệu ô nhập liệu và lỗi Validation thủ công thay cho AntD Form Instance
    const [formData, setFormData] = useState({ quality: '', m3u8Url: '' });
    const [formErrors, setFormErrors] = useState({});

    // State quản lý trạng thái ẩn hiện Popconfirm xác nhận xóa tự chế theo dòng ID dữ liệu
    const [openPopconfirmId, setOpenPopconfirmId] = useState(null);

    // Theo dõi và cập nhật liên tục các ký tự khi gõ phím vào ô nhập liệu
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };
    // Tải danh sách chất lượng video từ Backend
    const fetchQualities = async (page = 0, size = 10) => {
        if (!episodeId || episodeId === "undefined") {
            console.log("Chưa tìm thấy episodeId hợp lệ!");
            return;
        }
        setListState(prev => ({ ...prev, loading: true }));
        try {
            // Nhận kết quả từ Service giải quyết bất đồng bộ
            const resData = await videoQualityService.getAllQualitiesForAdmin(episodeId, page, size);
            console.log('resData: ', resData);

            // Kiểm tra an toàn xem dữ liệu trả về có cấu trúc Pageable của Spring Boot hay không
            if (resData && resData.page) {
                setListState({
                    data: resData.content || [],
                    loading: false,
                    pagination: {
                        current: resData.page.number + 1,
                        pageSize: resData.page.size,
                        total: resData.page.totalElements
                    }
                });
            } else {
                // Dự phòng nếu Backend trả về mảng List trần (Không có bọc phân trang)
                const dataArray = Array.isArray(resData) ? resData : (resData?.content || []);
                setListState({
                    data: dataArray,
                    loading: false,
                    pagination: {
                        current: 1,
                        pageSize: dataArray.length || 10,
                        total: dataArray.length || 0
                    }
                });
            }
        } catch (err) {
            message.error(err.message || "Không thể tải danh sách chất lượng video!");
            setListState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchQualities(0, listState.pagination.pageSize);
    }, [episodeId]);

    // Xử lý khi đổi trang hoặc pageSize
    const handleTableChange = (pageIndex) => {
        fetchQualities(pageIndex, listState.pagination.pageSize);
    };

    // Mở Modal biểu mẫu ở trạng thái Thêm mới
    const showCreateModal = () => {
        setFormData({ quality: '', m3u8Url: '' });
        setFormErrors({});
        setModalState({ isOpen: true, editingRecord: null, submitting: false });
    };

    // Mở Modal biểu mẫu ở trạng thái Sửa và đổ dữ liệu cũ vào Form
    const showEditModal = (record) => {
        setFormErrors({});
        setFormData({
            quality: record.quality || '',
            m3u8Url: record.m3u8Url || ''
        });
        setModalState({ isOpen: true, editingRecord: record, submitting: false });
    };
    // Hệ thống kiểm tra dữ liệu đầu vào (Mô phỏng 100% các điều kiện rules cũ trên Form.Item)
    const validateForm = () => {
        const errors = {};
        if (!formData.quality.trim()) {
            errors.quality = 'Tên chất lượng video không được để trống';
        } else if (formData.quality.length > 50) {
            errors.quality = 'Tên chất lượng video không được vượt quá 50 ký tự';
        }

        if (!formData.m3u8Url.trim()) {
            errors.m3u8Url = 'Đường dẫn m3u8 không được để trống';
        } else if (formData.m3u8Url.length > 255) {
            errors.m3u8Url = 'Đường dẫn m3u8 không được vượt quá 255 ký tự';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Xử lý gửi dữ liệu Form lên Backend (Dùng chung cho cả Thêm và Sửa)
    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        setModalState(prev => ({ ...prev, submitting: true }));
        try {
            const submitData = {
                quality: formData.quality,
                m3u8Url: formData.m3u8Url
            };

            if (modalState.editingRecord) {
                // Chế độ Sửa: Gọi PUT /api/v1/admin/video-qualities/{id}
                await videoQualityService.updateQuality(modalState.editingRecord.id, submitData);
                message.success("Cập nhật chất lượng video thành công!");
            } else {
                // Chế độ Thêm: Gọi POST /api/v1/admin/episodes/{episodeId}/video-qualities
                await videoQualityService.createQuality(episodeId, submitData);
                message.success("Thêm mới chất lượng video thành công!");
            }
            setModalState(prev => ({ ...prev, isOpen: false }));
            fetchQualities(listState.pagination.current - 1, listState.pagination.pageSize);
        } catch (err) {
            message.error(err.message || "Thao tác thất bại!");
            setModalState(prev => ({ ...prev, submitting: false }));
        }
    };

    // Xử lý gọi API xóa cấu hình bản ghi chất lượng
    const handleDeleteQuality = async (id) => {
        try {
            await videoQualityService.deleteQuality(id);
            message.success("Xóa cấu hình chất lượng video thành công!");
            fetchQualities(listState.pagination.current - 1, listState.pagination.pageSize);
        } catch (err) {
            message.error(err.message || "Xóa thất bại!");
        }
    };

    // Cấu hình các cột dữ liệu hiển thị trên Ant Design Table
    // Các quy tắc định nghĩa cấu trúc của bạn được map trực tiếp vào cây JSX thuần dưới đây:

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Nút quay lại danh sách tập phim cũ */}
            <button
                type="button"
                onClick={() => navigate(`/admin/movies/${movieId}/episodes`)}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-500/40 text-sm font-medium px-4 py-2 rounded-lg shadow-xs mb-4 transition-all cursor-pointer focus:outline-none"
            >
                <ArrowLeftOutlined className="text-xs" />
                <span>Quay lại danh sách tập</span>
            </button>

            <div className="flex justify-between items-center mb-5 bg-white p-4 rounded-xl shadow-xs">
                <h2 className="text-xl font-bold text-slate-800 m-0">Quản lý Chất lượng Video (Tập ID: {episodeId})</h2>
                <button
                    type="button"
                    onClick={showCreateModal}
                    className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all shadow-md cursor-pointer active:scale-[0.99] border-none"
                >
                    <PlusOutlined />
                    <span>Thêm chất lượng mới</span>
                </button>
            </div>
            {/* Bảng dữ liệu hiển thị */}
            <div className="w-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden relative">
                
                {/* HIỆU ỨNG LOADING XOAY TRÒN */}
                {listState.loading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 transition-all">
                        <LoadingOutlined className="animate-spin text-3xl text-blue-600" />
                    </div>
                )}

                <div className="w-full overflow-x-auto style-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold select-none">
                                <th className="p-4 w-[70px]">Id</th>
                                <th className="p-4 w-[150px]">Độ phân giải</th>
                                <th className="p-4">Đường dẫn luồng phát (M3U8 URL)</th>
                                <th className="p-4 w-[160px] text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {listState.data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-medium bg-white select-none">
                                        Không có dữ liệu cấu hình luồng phát nào được tìm thấy.
                                    </td>
                                </tr>
                            ) : (
                                listState.data.map((record, index) => (
                                    <tr key={`quality-row-${record.id || index}`} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="p-4 font-mono text-xs text-slate-500">{record.id}</td>
                                        <td className="p-4"><strong className="font-bold text-slate-900">{record.quality}</strong></td>
                                        <td className="p-4 font-mono text-xs text-slate-500 max-w-xs md:max-w-md lg:max-w-lg truncate" title={record.m3u8Url}>
                                            {record.m3u8Url}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => showEditModal(record)}
                                                    className="inline-flex items-center gap-1 bg-white border border-blue-400 text-blue-500 hover:bg-blue-50 text-xs font-medium px-2 py-1.5 rounded transition-all cursor-pointer"
                                                >
                                                    <EditOutlined className="text-[11px]" />
                                                    <span>Sửa</span>
                                                </button>
                                                
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPopconfirmId === record.id ? setOpenPopconfirmId(null) : setOpenPopconfirmId(record.id)}
                                                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2 py-1.5 rounded transition-all cursor-pointer shadow-xs border-none"
                                                    >
                                                        <DeleteOutlined className="text-[11px]" />
                                                        <span>Xóa</span>
                                                    </button>

                                                    {openPopconfirmId === record.id && (
                                                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50 text-left whitespace-normal animate-in fade-in slide-in-from-bottom-1 duration-150">
                                                            <h5 className="font-bold text-slate-800 text-xs mb-1">Xóa chất lượng video</h5>
                                                            <p className="text-slate-500 text-[11px] leading-normal mb-2">
                                                                Bạn có chắc chắn muốn xóa cấu hình chất lượng này không?
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
                                                                        handleDeleteQuality(record.id);
                                                                        setOpenPopconfirmId(null);
                                                                    }}
                                                                    className="px-2 py-1 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded transition-colors cursor-pointer border-none shadow-xs"
                                                                >
                                                                    Có, xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* KHỐI PHÂN TRANG (PAGINATION ACCORDING TO SPRING BOOT DATA) */}
                {listState.pagination.total > 0 && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-500 select-none">
                        <span>Tổng số: <strong className="font-bold text-slate-800">{listState.pagination.total}</strong> kết quả (Hiển thị mốc {listState.pagination.pageSize} luồng / trang)</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={listState.pagination.current === 1}
                                onClick={() => handleTableChange(listState.pagination.current - 2)}
                                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-bold cursor-pointer transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1.5 bg-cyan-600 text-white rounded font-bold">
                                {listState.pagination.current}
                            </span>
                            <button
                                type="button"
                                disabled={listState.pagination.current * listState.pagination.pageSize >= listState.pagination.total}
                                onClick={() => handleTableChange(listState.pagination.current)}
                                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-bold cursor-pointer transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal Form thêm / sửa */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Lớp nền mờ (Backdrop overlay) */}
                    <div 
                        onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                        className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
                    />
                    
                    {/* Thân hộp thoại Modal */}
                    <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 select-none">
                            {modalState.editingRecord ? "Cập nhật chất lượng video" : "Thêm chất lượng video mới"}
                        </h3>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Tên chất lượng / Độ phân giải */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600 flex items-center gap-0.5">
                                    Tên chất lượng / Độ phân giải <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    name="quality"
                                    value={formData.quality}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 1080p, 720p, 4K..."
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.quality ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.quality && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.quality}</span>
                                )}
                            </div>

                            {/* Đường dẫn luồng phát (M3U8 URL) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600 flex items-center gap-0.5">
                                    Đường dẫn luồng phát (M3U8 URL) <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    name="m3u8Url"
                                    value={formData.m3u8Url}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: https://example.com"
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.m3u8Url ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.m3u8Url && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.m3u8Url}</span>
                                )}
                                {/*pattern: /^https?:\/\/.*\.m3u8$/, / message: 'Đường dẫn phải là định dạng link m3u8 hợp lệ (Bắt đầu bằng http/https và kết thúc bằng .m3u8)' */}
                            </div>

                            {/* Thanh công cụ nút bấm điều khiển footer */}
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-5 select-none">
                                <button
                                    type="button"
                                    onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalState.submitting}
                                    className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed border-none"
                                >
                                    {modalState.submitting && <LoadingOutlined className="animate-spin text-sm" />}
                                    <span>{modalState.editingRecord ? "Cập nhật" : "Tạo mới"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoQualityListManager;
