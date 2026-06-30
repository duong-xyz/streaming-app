import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

const MainLayout = () => {
    return (
        <div className='flex flex-col min-h-screen bg-[#0b0c10]'>
            <Header />
            <main className='flex-grow'>
                <Outlet />
            </main>
            <footer className='bg-[#1f2833] py-4 text-center text-gray-500 text-xs border-t border-gray-800'>
                {new Date().getFullYear()} XYZ Streaming - Nền tảng xem phim hoạt hình 3d chất lượng cao
            </footer>
        </div>
    );
};

export default MainLayout;