import { Outlet, useLocation } from 'react-router-dom';
import SideBarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import { useState } from 'react';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-100 select-none">
            
            {/* THANH SIDEBAR TRÁI - Nhận diện path và kiểm soát co giãn */}
            <SideBarAdmin 
                collapsed={collapsed}
                currentpath={location.pathname}
                setCollapsed={setCollapsed}
            />

            {/* Thay thế Layout bọc nội dung bằng khối div flex-col chiếm trọn phần màn hình còn lại */}
            <div className="flex flex-col flex-1 h-full min-w-0 bg-[#0f172a]">
                
                {/* THANH HEADER TRÊN - Điều khiển đóng mở menu bên */}
                <HeaderAdmin 
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                />

                <main className="p-8 overflow-y-auto bg-white flex-1 min-h-0 style-scrollbar">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};

export default AdminLayout;
