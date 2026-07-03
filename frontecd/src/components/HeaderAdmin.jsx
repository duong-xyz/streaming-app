import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

const HeaderAdmin = ({ collapsed, onToggleCollapse }) => {
    return (
        <header className='bg-slate-100 border-b border-slate-200 h-16 px-6 flex items-center justify-between'>
            
            {/* NÚT CO GIÃN SIDEBAR */}
            <button 
                type='button'
                onClick={onToggleCollapse}
                className='text-slate-800/85 hover:text-cyan-600 text-lg p-2 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer flex items-center justify-center focus:outline-none'
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            {/* THÔNG TIN TÀI KHOẢN ADMIN */}
            <div className='flex items-center gap-3 text-slate-600'>
                <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></div>
                <span className='text-sm select-none'>
                    Xin Chào, <strong className='text-slate-800 font-bold'>Admin</strong>
                </span>
            </div>

        </header>
    );
};

export default HeaderAdmin;
