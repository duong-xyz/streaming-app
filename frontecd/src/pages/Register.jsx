import React, { useState } from 'react';
import { UserOutlined, LockOutlined, MailOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd'; // Giữ lại message thông báo hệ thống theo code gốc
import authService from '../services/authService';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State lưu trữ dữ liệu các ô nhập liệu
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State lưu trữ các lỗi validation cục bộ thay thế cho rules của AntD
  const [errors, setErrors] = useState({});

  // Theo dõi và đồng bộ hóa các ký tự gõ vào ô input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa bỏ thông báo lỗi cục bộ của trường đó ngay khi người dùng gõ phím thay đổi
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Hệ thống kiểm tra dữ liệu ngầm (Mô phỏng 100% rules quy định từ Ant Design Form)
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Kiểm tra trường Tài khoản
    if (!formData.username.trim()) {
      newErrors.username = 'Tài khoản không được để trống!';
    } else if (formData.username.length < 4 || formData.username.length > 150) {
      newErrors.username = 'Tài khoản phải từ 4 đến 150 ký tự!';
    }

    // Kiểm tra trường Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống!';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng!';
    } else if (formData.email.length > 150) {
      newErrors.email = 'Email không được vượt quá 150 ký tự!';
    }

    // Kiểm tra trường Mật khẩu
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống!';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên!';
    }

    // Kiểm tra trường Nhập lại mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu!';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu nhập lại không trùng khớp!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm kích hoạt khi submit Form (Bảo toàn 100% logic onFinish và onFinishFailed cũ)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Nếu kiểm tra Frontend thất bại -> Kích hoạt cơ chế onFinishFailed của bạn
    if (!validateForm()) {
      console.warn("Gói tin bị chặn lại tại Frontend do lỗi nhập liệu:", errors);
      message.warning("Vui lòng điền đúng và đầy đủ thông tin theo các hướng dẫn màu đỏ!");
      return;
    }

    setLoading(true);
    try {
      // Loại bỏ confirmPassword trước khi đóng gói payload đẩy lên Spring Boot
      const { username, email, password } = formData;

      // Gọi API đăng ký với quyền ban đầu mặc định là USER
      await authService.register({ username, email, password, role: 'USER' });

      message.success('Đăng ký tài khoản thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error) {
      console.dir(error);
      if (error.response) {
        console.log("Dữ liệu lỗi từ Spring Boot:", error.response.data);
      }
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b0c10] p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-[#1f2833] rounded-lg shadow-2xl border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6 tracking-wide">ĐĂNG KÝ</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Account */}
          <div className="flex flex-col gap-1.5">
            <div className={`relative flex items-center bg-[#151a21] border rounded-lg px-3.5 py-2.5 transition-all duration-200 group focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 ${
              errors.username ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-[#374151]'
            }`}>
              <UserOutlined className={`text-base transition-colors ${errors.username ? 'text-red-400' : 'text-cyan-500 group-focus-within:text-cyan-400'}`} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Tài khoản"
                className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm outline-none border-none pl-2.5"
              />
            </div>
            {errors.username && (
              <span className="text-xs text-red-500 pl-1 animate-in fade-in duration-150">{errors.username}</span>
            )}
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1.5">
            <div className={`relative flex items-center bg-[#151a21] border rounded-lg px-3.5 py-2.5 transition-all duration-200 group focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 ${
              errors.email ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-[#374151]'
            }`}>
              <MailOutlined className={`text-base transition-colors ${errors.email ? 'text-red-400' : 'text-cyan-500 group-focus-within:text-cyan-400'}`} />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm outline-none border-none pl-2.5"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-500 pl-1 animate-in fade-in duration-150">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className={`relative flex items-center bg-[#151a21] border rounded-lg px-3.5 py-2.5 transition-all duration-200 group focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 ${
              errors.password ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-[#374151]'
            }`}>
              <LockOutlined className={`text-base transition-colors ${errors.password ? 'text-red-400' : 'text-cyan-500 group-focus-within:text-cyan-400'}`} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm outline-none border-none pl-2.5"
              />
            </div>
            {errors.password && (
              <span className="text-xs text-red-500 pl-1 animate-in fade-in duration-150">{errors.password}</span>
            )}
          </div>

          {/* Re-password */}
          <div className="flex flex-col gap-1.5">
            <div className={`relative flex items-center bg-[#151a21] border rounded-lg px-3.5 py-2.5 transition-all duration-200 group focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 ${
              errors.confirmPassword ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20' : 'border-[#374151]'
            }`}>
              <LockOutlined className={`text-base transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-cyan-500 group-focus-within:text-cyan-400'}`} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full bg-transparent text-white placeholder:text-gray-500 text-sm outline-none border-none pl-2.5"
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-red-500 pl-1 animate-in fade-in duration-150">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600/50 disabled:text-black/50 text-black font-semibold py-2.5 rounded-lg transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer disabled:cursor-not-allowed"
          >
            {loading && <LoadingOutlined className="animate-spin text-base" />}
            <span>{loading ? 'Đang xử lý...' : 'Đăng Ký'}</span>
          </button>
        </form>

        {/* Link */}
        <div className="text-center mt-5 text-sm">
          <span className="text-gray-400">Đã có tài khoản? </span>
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
