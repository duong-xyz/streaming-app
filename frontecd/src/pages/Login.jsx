import React, { useState } from 'react';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd'; // Giữ lại message thông báo giống code gốc của bạn
import authService from '../services/authService'; 
import { loginSuccess } from '../store/slice/authSlice';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '' });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Đồng bộ thay đổi dữ liệu trong ô Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa thông báo lỗi khi người dùng bắt đầu gõ lại
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Logic kiểm tra dữ liệu đầu vào (thay thế hệ thống rules của Form.Item AntD)
  const validateForm = () => {
    let valid = true;
    const newErrors = { username: '', password: '' };

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tài khoản!';
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu!';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Hàm xử lý khi nhấn Submit Form (Giữ nguyên hoàn toàn logic API của bạn)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.login(formData);
      dispatch(loginSuccess(response.data));
      message.success('Đăng nhập thành công!');
      navigate('/'); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b0c10] p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-[#1f2833] rounded-lg shadow-2xl border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6 tracking-wide">ĐĂNG NHẬP</h2>
        
        {/* FORM THUẦN HTML - Thay thế cho cấu trúc Form của AntD */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* TRƯỜNG DỮ LIỆU: TÀI KHOẢN */}
          <div className="flex flex-col gap-1.5">
            <div className={`relative flex items-center bg-[#151a21] border rounded-lg px-3.5 py-2.5 transition-all duration-200 group focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 ${
              errors.username ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-[#374151]'
            }`}>
              <UserOutlined className={`text-base transition-colors ${errors.username ? '!text-red-400' : '!text-gray-400 group-focus-within:text-cyan-400'}`} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Tài khoản"
                className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm outline-none border-none pl-2.5"
              />
            </div>
            {/* Hiển thị lỗi Validation y hệt AntD rules */}
            {errors.username && (
              <span className="text-xs text-red-500 pl-1 animate-in fade-in duration-150">{errors.username}</span>
            )}
          </div>

          {/* TRƯỜNG DỮ LIỆU: MẬT KHẨU */}
          <div className="flex flex-col gap-1.5">
            <div className={`relative flex items-center bg-[#151a21] border rounded-lg px-3.5 py-2.5 transition-all duration-200 group focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 ${
              errors.password ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-[#374151]'
            }`}>
              <LockOutlined className={`text-base transition-colors ${errors.password ? '!text-red-400' : '!text-gray-400 group-focus-within:text-cyan-400'}`} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm outline-none border-none pl-2.5"
              />
            </div>
            {/* Hiển thị lỗi Validation */}
            {errors.password && (
              <span className="text-xs text-red-500 pl-1 animate-in fade-in duration-150">{errors.password}</span>
            )}
          </div>

          {/* NÚT SUBMIT ĐĂNG NHẬP */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600/50 disabled:text-black/50 text-black font-semibold py-2.5 rounded-lg transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer disabled:cursor-not-allowed"
          >
            {loading && <LoadingOutlined className="animate-spin text-base" />}
            <span>{loading ? 'Đang xử lý...' : 'Đăng Nhập'}</span>
          </button>
        </form>
        
        {/* ĐIỀU HƯỚNG SANG ĐĂNG KÝ */}
        <div className="text-center mt-5 text-sm">
          <span className="text-gray-400">Chưa có tài khoản? </span>
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
