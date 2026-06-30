import { useEffect, useState } from "react";
import { 
    EditOutlined, DeleteOutlined, PlusOutlined, 
    VideoCameraOutlined, LoadingOutlined 
} from '@ant-design/icons'; 
import { message } from 'antd'; // Giữ lại message thông báo hệ thống theo code gốc
import episodeService from '../services/episodeService';
import { useParams, useNavigate } from 'react-router-dom';

const EpisodeListManager = () => {
    const { movieId } = useParams(); 
    const navigate = useNavigate();

    // 1. Gộp các state liên quan đến danh sách (Table) vào 1 Object
    const [listState, setListState] = useState({
        data: [],
        loading: true,
        pagination: { current: 1, pageSize: 10, total: 0 }
    });

    // 2. Gộp các state liên quan đến Modal Form vào 1 Object
    const [modalState, setModalState] = useState({
        isOpen: false,
        editingRecord: null, // null = Thêm mới, có object = Sửa
        submitting: false
    });

    // Khởi tạo State lưu trữ dữ liệu ô nhập liệu và lỗi validation thay cho AntD Form Instance
    const [formData, setFormData] = useState({ episodeNumber: '', title: '', status: '' });
    const [formErrors, setFormErrors] = useState({});

    // State cục bộ để đóng mở hộp thoại Popconfirm tự chế theo từng dòng Id
    const [openPopconfirmId, setOpenPopconfirmId] = useState(null);

    // Theo dõi thay đổi ký tự trong biểu mẫu Modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };
    // Hàm fetch dữ liệu phân trang
    const fetchEpisodes = async (page = 0, size = 10) => {
        if (!movieId || movieId === "undefined") {
            console.log("Chưa tìm thấy movieId hợp lệ!");
            return;
        }
        
        // Cập nhật trạng thái loading cho danh sách
        setListState(prev => ({ ...prev, loading: true }));
        
        try {
            const resData = await episodeService.getAllEpisodesByMovieForAdmin(movieId, page, size);
            
            setListState({
                data: resData.content || [],
                loading: false,
                pagination: {
                    current: resData.page.number + 1,
                    pageSize: resData.page.size,
                    total: resData.page.totalElements
                }
            });
        } catch (err) {
            message.error(err.message || "Không thể tải danh sách episodes!");
            setListState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchEpisodes(0, listState.pagination.pageSize);
    }, [movieId]);

    // Xử lý chuyển trang trên Table (Chạy khi click nút phân trang tự chế)
    const handlePageChange = (pageIndex) => {
        fetchEpisodes(pageIndex, listState.pagination.pageSize);
    };

    // Mở biểu mẫu Thêm mới tập phim
    const showCreateModal = () => {
        setFormData({ episodeNumber: '', title: '', status: '' });
        setFormErrors({});
        setModalState({ isOpen: true, editingRecord: null, submitting: false });
    };

    // Mở biểu mẫu Cập nhật tập phim và đổ dữ liệu dòng được chọn
    const showEditModal = (record) => {
        setFormErrors({});
        setFormData({
            episodeNumber: record.episodeNumber || '',
            title: record.title || '',
            status: record.status?.code || '' // Đổ mã code (PROCESSING/READY) vào Select
        });
        setModalState({ isOpen: true, editingRecord: record, submitting: false });
    };
    // Logic kiểm soát lỗi dữ liệu đầu vào của biểu mẫu Modal (Mô phỏng 100% quy định rules cũ)
    const validateForm = () => {
        const errors = {};
        const epNum = Number(formData.episodeNumber);

        if (formData.episodeNumber === '' || formData.episodeNumber === undefined || formData.episodeNumber === null) {
            errors.episodeNumber = 'Số tập phim không được để trống';
        } else if (isNaN(epNum) || !Number.isInteger(epNum) || epNum < 1) {
            errors.episodeNumber = 'Số tập phim phải là số nguyên dương lớn hơn 0';
        }

        if (formData.title && formData.title.length > 255) {
            errors.title = 'Tiêu đề tập phim không được vượt quá 255 ký tự';
        }

        if (modalState.editingRecord && !formData.status) {
            errors.status = 'Trạng thái tập phim không được để trống';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Hàm xử lý gửi dữ liệu Form lên Backend (Dùng chung cho cả Thêm và Sửa)
    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        setModalState(prev => ({ ...prev, submitting: true }));
        try {
            if (modalState.editingRecord) {
                // Chế độ Sửa: Khớp với cấu trúc EpisodeUpdateForm
                const updateForm = {
                    episodeNumber: Number(formData.episodeNumber),
                    title: formData.title,
                    status: formData.status
                };
                await episodeService.updateEpisode(modalState.editingRecord.id, updateForm);
                message.success("Cập nhật tập phim thành công!");
            } else {
                // Chế độ Thêm: Khớp với cấu trúc EpisodeCreateForm
                const createForm = {
                    episodeNumber: Number(formData.episodeNumber),
                    title: formData.title
                };
                await episodeService.createEpisode(movieId, createForm);
                message.success("Thêm tập phim mới thành công!");
            }
            setModalState(prev => ({ ...prev, isOpen: false })); // Đóng Modal
            fetchEpisodes(listState.pagination.current - 1, listState.pagination.pageSize); // Tải lại bảng
        } catch (err) {
            message.error(err.message || "Thực hiện thao tác thất bại!");
            setModalState(prev => ({ ...prev, submitting: false }));
        }
    };

    // Xử lý gọi API xóa tập phim
    const handleDeleteEpisode = async (episodeId) => {
        try {
            await episodeService.deleteEpisode(episodeId); 
            message.success("Xóa tập phim thành công!");
            fetchEpisodes(listState.pagination.current - 1, listState.pagination.pageSize);
        } catch (err) {
            message.error(err.message || "Xóa tập phim thất bại!");
        }
    };

    const showVideoQualityList = (episodeId) => {
        navigate(`/admin/movies/${movieId}/episodes/${episodeId}/video-qualities`);
    };

    // Định dạng chuỗi ngày tháng ISO sang kiểu hiển thị Việt Nam
    const formatDateTime = (dateString) => {
        if (!dateString) return "---";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; 
        
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };
    // ================= GIAO DIỆN HIỂN THỊ CHÍNH (RETURN) =================
    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Thanh công cụ tiêu đề và nút Thêm mới */}
            <div className="flex justify-between items-center mb-5 bg-white p-4 rounded-xl shadow-xs">
                <h2 className="text-xl font-bold text-slate-800 m-0">Quản lý danh sách tập phim</h2>
                <button 
                    type="button"
                    onClick={showCreateModal}
                    className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all shadow-md cursor-pointer active:scale-[0.99] border-none"
                >
                    <PlusOutlined />
                    <span>Thêm tập mới</span>
                </button>
            </div>

            {/* Bảng hiển thị Antd Table bóc tách dữ liệu từ listState */}
            <div className="w-full bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden relative">
                
                {/* HIỆU ỨNG TẢI DỮ LIỆU: Kích hoạt khi listState.loading === true */}
                {listState.loading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 transition-all">
                        <LoadingOutlined className="animate-spin text-3xl text-blue-600" />
                    </div>
                )}

                {/* Khung cuộn ngang bảo vệ bảng dữ liệu */}
                <div className="w-full overflow-x-auto style-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold select-none">
                                <th className="p-4 w-[70px]">Id</th>
                                <th className="p-4 w-[100px]">Tập phim</th>
                                <th className="p-4">Tiêu đề</th>
                                <th className="p-4 w-[110px]">Lượt xem</th>
                                <th className="p-4 w-[160px]">Trạng thái</th>
                                <th className="p-4">Ngày tạo</th>
                                <th className="p-4">Ngày cập nhật</th>
                                <th className="p-4 w-[160px] text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {listState.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400 font-medium bg-white select-none">
                                        Không có dữ liệu tập phim nào được tìm thấy.
                                    </td>
                                </tr>
                            ) : (
                                listState.data.map((record, index) => {
                                    const statusDisplay = record.status?.displayName || record.status?.code;
                                    const isProcessing = record.status?.code === 'PROCESSING';

                                    return (
                                        <tr key={`episode-row-${record.id || index}`} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="p-4 font-mono text-xs text-slate-500">{record.id}</td>
                                            <td className="p-4"><b className="font-bold text-slate-900">Tập {record.episodeNumber}</b></td>
                                            <td className="p-4 font-medium max-w-[200px] truncate" title={record.title}>{record.title || "---"}</td>
                                            <td className="p-4 font-mono">
                                                {record.views !== null && record.views !== undefined ? record.views.toLocaleString('vi-VN') : 0}
                                            </td>
                                            <td className="p-4">
                                                {!record.status ? (
                                                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600 rounded-full select-none">
                                                        Không xác định
                                                    </span>
                                                ) : (
                                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border select-none ${
                                                        isProcessing 
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                                            : 'bg-green-50 text-green-700 border-green-200'
                                                    }`}>
                                                        {statusDisplay}
                                                    </span>
                                                )}
                                            </td>
                                            
                                            {/* func có 3 params: (text, record, index)=>{} text trỏ vào value của dataIndex, */}
                                            {/* record là toàn bộ object chứa biến có value mà dataIndex trỏ vào -> 'createdAt' */}
                                            {/* index là số thứ tự - chỉ mục */}
                                            <td className="p-4 text-xs text-slate-500">{formatDateTime(record.createdAt)}</td>
                                            <td className="p-4 text-xs text-slate-500">{formatDateTime(record.updatedAt)}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => showVideoQualityList(record.id)}
                                                        className="inline-flex items-center gap-1 bg-white border border-blue-400 text-blue-500 hover:bg-blue-50 text-xs font-medium px-2 py-1.5 rounded transition-all cursor-pointer"
                                                    >
                                                        <VideoCameraOutlined className="text-[11px]" />
                                                        <span>Chất lượng video</span>
                                                    </button>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => showEditModal(record)} // Gọi hàm truyền trọn vẹn dữ liệu hàng để sửa
                                                        className="inline-flex items-center gap-1 bg-white border border-cyan-500 text-cyan-600 hover:bg-cyan-50 text-xs font-medium px-2 py-1.5 rounded transition-all cursor-pointer"
                                                    >
                                                        <EditOutlined className="text-[11px]" />
                                                        <span>Sửa</span>
                                                    </button>
                                                    
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenPopconfirmId(openPopconfirmId === record.id ? null : record.id)}
                                                            className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2 py-1.5 rounded transition-all cursor-pointer shadow-xs border-none"
                                                        >
                                                            <DeleteOutlined className="text-[11px]" />
                                                            <span>Xóa</span>
                                                        </button>

                                                        {openPopconfirmId === record.id && (
                                                            <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50 text-left animate-in fade-in slide-in-from-bottom-1 duration-150">
                                                                <h5 className="font-bold text-slate-800 text-xs mb-1">Xóa tập phim</h5>
                                                                <p className="text-slate-500 text-[11px] leading-normal mb-2 whitespace-normal">
                                                                    Bạn có chắc chắn muốn xóa tập phim này khỏi hệ thống không?
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
                                                                            handleDeleteEpisode(record.id);
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
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {/* KHỐI PHÂN TRANG (PAGINATION ACCORDING TO listState.pagination) */}
                {listState.pagination.total > 0 && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-500 select-none">
                        <span>Tổng số: <strong className="font-bold text-slate-800">{listState.pagination.total}</strong> kết quả</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={listState.pagination.current === 1}
                                onClick={() => handlePageChange(listState.pagination.current - 2)}
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
                                onClick={() => handlePageChange(listState.pagination.current)}
                                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 font-bold cursor-pointer transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hộp thoại Modal biểu mẫu chung bóc tách điều khiển từ modalState -> Tái cấu trúc thuần v4 */}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Lớp nền mờ (Backdrop overlay) */}
                    <div 
                        onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                        className="absolute inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
                    />
                    
                    {/* Nội dung hộp thoại Modal */}
                    <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 select-none">
                            {modalState.editingRecord ? "Cập nhật thông tin tập phim" : "Thêm tập phim mới"}
                        </h3>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Số tập phim */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Số tập phim</label>
                                <input 
                                    type="number"
                                    name="episodeNumber"
                                    value={formData.episodeNumber}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 1, 2, 3..."
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.episodeNumber ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.episodeNumber && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.episodeNumber}</span>
                                )}
                            </div>

                            {/* Tiêu đề tập phim */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Tiêu đề tập phim</label>
                                <input 
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tiêu đề cho tập phim (không bắt buộc)"
                                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all ${
                                        formErrors.title ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                    }`}
                                />
                                {formErrors.title && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.title}</span>
                                )}
                            </div>

                            {/* Ô lựa chọn trạng thái chỉ xuất hiện riêng ở chế độ Sửa */}
                            {modalState.editingRecord && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-600">Trạng thái tập phim</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm outline-none transition-all cursor-pointer ${
                                            formErrors.status ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        <option value="PROCESSING">Đang xử lý/Convert</option>
                                        <option value="READY">Sẵn sàng chiếu</option>
                                    </select>
                                    {formErrors.status && (
                                        <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.status}</span>
                                    )}
                                </div>
                            )}

                            {/* Thanh công cụ nút bấm của Modal */}
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-5 select-none">
                                <button
                                    type="button"
                                    onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border-none"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalState.submitting}
                                    className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed border-none"
                                >
                                    {modalState.submitting && <LoadingOutlined className="animate-spin text-sm" />}
                                    <span>{modalState.editingRecord ? "Lưu thay đổi" : "Tạo mới"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EpisodeListManager;
