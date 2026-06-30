import React, { useEffect, useState } from 'react';
import { 
    EditOutlined, UserOutlined, MailOutlined, 
    SafetyCertificateOutlined, LockOutlined, 
    CalendarOutlined, DeleteOutlined, LoadingOutlined 
} from '@ant-design/icons';
import { message } from 'antd'; // Giữ lại message thông báo hệ thống theo code gốc
import userService from '../services/userService';

function UserListManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Quản lý đồng bộ lệch pha chỉ mục phân trang (Spring Boot bắt đầu từ 0 | Ant Design từ 1)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Quản lý đóng mở cửa sổ Modal và kiểm soát trạng thái Form dữ liệu
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null); // Lưu ID của User đang được chọn chỉnh sửa
    const [submitting, setSubmitting] = useState(false);

    // Khởi tạo các State lưu trữ dữ liệu ô nhập liệu và lỗi Validation thủ công thay cho AntD Form Instance
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // State quản lý trạng thái ẩn hiện Popconfirm xác nhận xóa tự chế theo dòng ID dữ liệu
    const [openPopconfirmId, setOpenPopconfirmId] = useState(null);

    // Theo dõi và cập nhật liên tục các ký tự khi gõ phím vào ô nhập liệu
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Tự động tải danh sách thành viên ngay khi vừa khởi tạo Component lên màn hình
    useEffect(() => {
        fetchUsers(0, pagination.pageSize);
    }, []);
    // 1. Hàm nạp danh sách dữ liệu từ hệ thống Backend
    const fetchUsers = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers(page, size);
            console.log(data);

            setUsers(data.content);
            setPagination({
                current: data.page.number + 1, // Cộng 1 để hiển thị tương thích giao diện Ant Design
                pageSize: data.page.size,
                total: data.page.totalElements
            });
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể tải danh sách tài khoản người dùng!");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi quản trị viên thực hiện thao tác chuyển trang hoặc thay đổi số lượng hiển thị trên Table
    const handlePageChange = (pageIndex) => {
        fetchUsers(pageIndex, pagination.pageSize);
    };

    // 2. Hàm xử lý mở Modal và đẩy dữ liệu cũ của dòng được chọn vào Form
    const handleOpenEditModal = (record) => {
        setEditingUserId(record.id);
        setFormErrors({}); // Làm sạch bảng báo lỗi cũ

        setFormData({
            username: record.username || '',
            email: record.email || '',
            role: record.role || '', // Giá trị dạng String nhận từ Backend ("ADMIN" hoặc "USER")
            password: ''       // Để trống mật khẩu, chỉ điền khi muốn đổi mật khẩu mới
        });
        setIsModalOpen(true);
    };
    // Trình kiểm soát lỗi dữ liệu đầu vào (Mô phỏng 100% quy định rules cũ của Form.Item)
    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.username.trim()) {
            errors.username = 'Trường thông tin tài khoản bắt buộc nhập!';
        } else if (formData.username.length < 4 || formData.username.length > 150) {
            errors.username = 'Độ dài dữ liệu tài khoản hợp lệ từ 4 đến 150 ký tự!';
        }

        if (!formData.email.trim()) {
            errors.email = 'Trường dữ liệu thư điện tử bắt buộc nhập!';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Cấu trúc định dạng Email nhập vào chưa chính xác!';
        } else if (formData.email.length > 150) {
            errors.email = 'Dữ liệu địa chỉ Email giới hạn tối đa 150 ký tự!';
        }

        if (formData.password && (formData.password.length < 6 || formData.password.length > 255)) {
            errors.password = 'Độ dài mật khẩu yêu cầu từ 6 ký tự đến tối đa 255 ký tự!';
        }

        if (!formData.role) {
            errors.role = 'Vui lòng chỉ định chính xác cấp bậc quyền hạn!';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 3. Hàm xử lý thu thập và gửi dữ liệu chuẩn cấu trúc lên API Server (UserUpdateForm)
    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            // Sao chép dữ liệu và kiểm tra trường mật khẩu để tối ưu
            const formattedValues = {
                username: formData.username,
                email: formData.email,
                role: formData.role,
                password: formData.password
            };
            
            if (!formattedValues.password || formattedValues.password.trim() === '') {
                delete formattedValues.password; // Nếu để trống thì loại bỏ trường, giữ nguyên mật khẩu cũ ở DB
            }

            console.log("Dữ liệu UserUpdateForm gửi lên Spring Boot:", formattedValues);

            await userService.updateUser(editingUserId, formattedValues);
            message.success("Cập nhật thông tin thành viên thành công!");

            setIsModalOpen(false);
            fetchUsers(pagination.current - 1, pagination.pageSize); // Làm mới danh sách tại trang hiện tại
        } catch (error) {
            if (error.response) {
                message.error(error.response.data?.message || "Lưu thông tin thất bại!");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // 4. Hàm xử lý gửi yêu cầu xóa người dùng lên Server
    const handleDelete = async (id) => {
        try {
            await userService.deleteUser(id);
            message.success("Xóa tài khoản người dùng thành công!");

            // Tải lại danh sách dữ liệu tại trang hiện tại sau khi xóa
            fetchUsers(pagination.current - 1, pagination.pageSize);
        } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);
            message.error(error.response?.data?.message || "Xóa thất bại! Vui lòng kiểm tra lại quyền hạn.");
        }
    };
    // Định nghĩa danh sách các cấu trúc cột hiển thị trên bảng dữ liệu Ant Design Table
    // Các quy tắc bóc tách dữ liệu từ các cột của bạn được map trực tiếp vào cây JSX thuần dưới đây:

    return (
        <div className="p-2 bg-white rounded-lg shadow-sm text-sm text-slate-700 flex flex-col w-full min-w-0">
            {/* Header điều hướng của trang quản trị thành viên */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 select-none">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 m-0">Hệ Thống Quản Lý Người Dùng</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Xem thông tin phân trang, điều chỉnh phân quyền (ADMIN/USER) và đồng bộ dữ liệu bảo mật hệ thống.
                    </p>
                </div>
            </div>

            {/* Bảng kết xuất dữ liệu thành viên -> Chuyển sang Cấu trúc Table HTML5 thuần v4 */}
            <div className="shadow-xs border border-slate-200 rounded-md overflow-hidden bg-white relative">
                
                {/* HIỆU ỨNG TẢI DỮ LIỆU ĐỘNG (loading={loading}) */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 transition-all">
                        <LoadingOutlined className="animate-spin text-3xl text-blue-600" />
                    </div>
                )}

                <div className="w-full style-scrollbar">
                    <table className="w-full text-left border-collapse text-sm table-fixed">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
                                <th className="p-4 w-[80px] text-center">ID</th>
                                <th className="p-4">Tên tài khoản</th>
                                <th className="p-4">Địa chỉ Email</th>
                                <th className="p-4 w-[150px] text-center">Quyền hạn (UserRole)</th>
                                <th className="p-4 w-[180px]">Thời gian khởi tạo</th>
                                <th className="p-4 w-[130px] text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium bg-white select-none">
                                        Không tìm thấy bất kỳ tài khoản người dùng nào trong hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                users.map((record, index) => {
                                    const isAdmin = record.role === 'ADMIN';

                                    return (
                                        <tr key={`user-row-${record.id || index}`} className="hover:bg-slate-50/50 transition-colors">
                                            {/* Cột ID */}
                                            <td className="p-4 font-mono text-xs text-slate-500 text-center">{record.id}</td>
                                            
                                            {/* Cột Tên tài khoản */}
                                            <td className="p-4 font-semibold text-slate-800">{record.username}</td>
                                            
                                            {/* Cột Địa chỉ Email */}
                                            <td className="p-4 font-mono text-slate-600">{record.email}</td>
                                            
                                            {/* Cột Quyền hạn (UserRole) */}
                                            <td className="p-4 text-center">
                                                <span className={`inline-block px-3 py-0.5 text-xs font-medium rounded select-none border ${
                                                    isAdmin 
                                                        ? 'bg-orange-50 text-orange-700 border-orange-200' 
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    {isAdmin ? 'Quản trị viên' : 'Người dùng'} ({record.role})
                                                </span>
                                            </td>
                                            
                                            {/* Cột Thời gian khởi tạo */}
                                            <td className="p-4">
                                                {record.createdAt ? (
                                                    <span className="text-slate-500 text-xs flex items-center gap-1">
                                                        <CalendarOutlined />
                                                        {new Date(record.createdAt).toLocaleString('vi-VN')}
                                                    </span>
                                                ) : '---'}
                                            </td>
                                            {/* Cột Hành động: render cụm Space lồng Buttons, Tooltips và Popconfirm */}
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 whitespace-nowrap relative">
                                                    
                                                    {/* Tooltip + Nút Chỉnh sửa thông tin tài khoản */}
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(record)}
                                                            className="inline-flex items-center justify-center bg-white border border-slate-200 text-blue-500 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 rounded transition-all cursor-pointer"
                                                        >
                                                            <EditOutlined />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-medium text-white bg-slate-800 rounded opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                                                            Chỉnh sửa thông tin tài khoản
                                                        </span>
                                                    </div>

                                                    {/* Nút xóa tài khoản bọc trong khung hỏi xác nhận an toàn */}
                                                    <div className="relative group/tooltip">
                                                        <button
                                                            type="button"
                                                            onClick={() => openPopconfirmId === record.id ? setOpenPopconfirmId(null) : setOpenPopconfirmId(record.id)}
                                                            className="inline-flex items-center justify-center bg-white border border-slate-200 text-red-500 hover:bg-red-50 w-8 h-8 rounded transition-all cursor-pointer"
                                                        >
                                                            <DeleteOutlined />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] font-medium text-white bg-slate-800 rounded opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xs">
                                                            Xóa tài khoản khỏi hệ thống
                                                        </span>

                                                        {/* HỘP THOẠI POPCONFIRM TỰ CHẾ: Xác nhận xóa tài khoản */}
                                                        {openPopconfirmId === record.id && (
                                                            <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50 text-left whitespace-normal animate-in fade-in slide-in-from-bottom-1 duration-150">
                                                                <h5 className="font-bold text-slate-800 text-xs mb-1">Xác nhận xóa tài khoản</h5>
                                                                <p className="text-slate-500 text-[11px] leading-normal mb-2">
                                                                    Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "{record.username}" không?
                                                                </p>
                                                                <div className="flex justify-end gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOpenPopconfirmId(null)}
                                                                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer border-none"
                                                                    >
                                                                        Hủy bỏ
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleDelete(record.id);
                                                                            setOpenPopconfirmId(null);
                                                                        }}
                                                                        className="px-2 py-1 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded transition-colors cursor-pointer border-none shadow-xs"
                                                                    >
                                                                        Có, Xóa ngay
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

                {/* KHỐI PHÂN TRANG (PAGINATION ACCORDING TO SPRING BOOT DATA) */}
                {pagination.total > 0 && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-500 select-none">
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
                            <span className="px-3 py-1.5 bg-blue-600 text-white rounded font-bold">
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
            {/* 3. Cửa sổ Modal biểu mẫu cập nhật dữ liệu cấu trúc */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    {/* Lớp nền mờ (Backdrop overlay) */}
                    <div 
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
                    />
                    
                    {/* Thân hộp thoại Modal */}
                    <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-slate-800 flex flex-col max-h-[90vh]">
                        <h3 className="border-b border-slate-100 pb-3 mb-4 select-none">
                            <span className="text-lg font-bold text-slate-700">
                                Cập nhật thành viên hệ thống (Mã định danh ID: {editingUserId})
                            </span>
                        </h3>

                        <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 style-scrollbar flex-1 pt-1" name="userUpdateForm">
                            {/* Ô nhập thông tin Tài khoản */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Tên tài khoản đăng nhập (Username)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-slate-400 flex items-center justify-center"><UserOutlined /></span>
                                    <input 
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tài khoản mới"
                                        className={`w-full bg-white border rounded-lg pl-9 pr-3.5 py-2 text-sm outline-none transition-all ${
                                            formErrors.username ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                </div>
                                {formErrors.username && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.username}</span>
                                )}
                            </div>

                            {/* Ô nhập thông tin Email */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Hộp thư điện tử (Email Address)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-slate-400 flex items-center justify-center"><MailOutlined /></span>
                                    <input 
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="username@domain.com"
                                        className={`w-full bg-white border rounded-lg pl-9 pr-3.5 py-2 text-sm outline-none transition-all ${
                                            formErrors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                </div>
                                {formErrors.email && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.email}</span>
                                )}
                            </div>

                            {/* Ô nhập thông tin đặt lại mật khẩu mới */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Thay đổi mật khẩu đăng nhập (Để trống trường này nếu giữ nguyên)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3.5 text-slate-400 flex items-center justify-center"><LockOutlined /></span>
                                    <input 
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Nhập chuỗi ký tự mật khẩu bảo mật mới"
                                        className={`w-full bg-white border rounded-lg pl-9 pr-3.5 py-2 text-sm outline-none transition-all ${
                                            formErrors.password ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                </div>
                                {formErrors.password && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.password}</span>
                                )}
                            </div>

                            {/* Ô lựa chọn danh mục phân quyền Enum hệ thống */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-600">Cấp bậc phân quyền quản trị (User Role Enum)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute right-3.5 text-slate-400 flex items-center justify-center pointer-events-none"><SafetyCertificateOutlined /></span>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className={`w-full bg-white border rounded-lg pl-3.5 pr-9 py-2 text-sm outline-none transition-all cursor-pointer select-none appearance-none ${
                                            formErrors.role ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    >
                                        <option value="">Lựa chọn phân hệ quyền hạn tài khoản</option>
                                        <option value="USER">USER (Quyền hạn thành viên thông thường - Mã lưu trữ DB: 20)</option>
                                        <option value="ADMIN">ADMIN (Quyền hạn quản trị tối cao hệ thống - Mã lưu trữ DB: 10)</option>
                                    </select>
                                </div>
                                {formErrors.role && (
                                    <span className="text-xs text-red-500 pl-0.5 animate-in fade-in duration-150">{formErrors.role}</span>
                                )}
                            </div>

                            {/* Thanh công cụ nút bấm chân Modal */}
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
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed border-none"
                                >
                                    {submitting && <LoadingOutlined className="animate-spin text-sm" />}
                                    <span>Xác nhận lưu</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserListManager;
