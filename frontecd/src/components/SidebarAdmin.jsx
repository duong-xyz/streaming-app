import { useNavigate } from 'react-router-dom';
import {
    DashboardOutlined, PlaySquareOutlined,
    VideoCameraOutlined, UserOutlined, 
    LogoutOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';

const SideBarAdmin = ({ collapsed, currentpath, setCollapsed }) => {
    const navigate = useNavigate();
    // Khai báo cấu trúc menu
    const menuItems = [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: '/admin/movies', icon: <VideoCameraOutlined />, label: 'Quản lý phim' },
        { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Thoát Admin',
            danger: true,
            style: { marginTop: 'auto' } // Đẩy nút logout đáy menu
        }
    ];

    const handleMenuClick = (key) => {
        if (key === 'logout') {
            navigate('/');
        } else {
            navigate(key);
        }
    };

    // cơ chế lắng nghe kích thước màn hình
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) { // Mốc 1024px tương đương breakpoint 'lg'
                if (setCollapsed) setCollapsed(true);
            } else {
                if (setCollapsed) setCollapsed(false);
            }
        };

        handleResize(); // Chạy kiểm tra lập tức khi vừa vào trang để đồng bộ trạng thái ban đầu
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setCollapsed]);
    return (
        <aside
            className={`border-r border-gray-100 bg-slate-100 h-screen sticky top-0 left-0 z-40 transition-all duration-300 ease-in-out overflow-hidden shadow-xs shrink-0 ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className='flex flex-col h-full'>
                
                {/* KHỐI BRANDING / LOGO ADMIN (Căn giữa icon khi collapse) */}
                <div className={`flex items-center gap-3 p-5 border-b border-gray-100 h-16 overflow-hidden whitespace-nowrap select-none shrink-0 transition-all duration-300 ${
                    collapsed ? 'justify-center p-4' : ''
                }`}>
                    <PlaySquareOutlined className='text-2xl text-cyan-600 shrink-0' />
                    {!collapsed && (
                        <span className='text-lg font-bold tracking-wider text-slate-700 animate-in fade-in duration-200 truncate'>
                            XYZ ADMIN
                        </span>
                    )}
                </div>

                {/* !flex !flex-col !h-[calc(100%-64px) */}
                <ul className={`bg-slate-100 flex-1 pt-4 pb-6 flex flex-col gap-1 list-none overflow-y-auto style-scrollbar transition-all duration-300 ${
                    collapsed ? 'px-2' : 'px-3'
                }`}>
                    {menuItems.map((item) => {
                        const isLogout = item.key === 'logout';
                        const isActive = currentpath === item.key;

                        return (
                            <li 
                                key={`sidebar-item-${item.key}`}
                                className={`w-full flex ${isLogout ? 'mt-auto' : ''}`} // Thừa hưởng style: { marginTop: 'auto' } để đẩy logout xuống đáy
                            >
                                <button
                                    type="button"
                                    onClick={() => handleMenuClick(item.key)}
                                    title={collapsed ? item.label : ''} // Hiện tooltip tên chức năng khi rê chuột vào icon lúc thu gọn
                                    className={`w-full flex items-center gap-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 cursor-pointer text-left focus:outline-none ${
                                        collapsed ? 'justify-center px-0' : 'px-4'
                                    } ${
                                        isLogout
                                            ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                            : isActive
                                                ? 'bg-cyan-500/10 text-cyan-600 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                                    }`}
                                    style={collapsed ? {} : { paddingLeft: '20px' }}
                                >
                                    <span className="text-base shrink-0 flex items-center justify-center">
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <span className="truncate whitespace-nowrap animate-in fade-in duration-150">
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
};

export default SideBarAdmin;
