import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { message } from 'antd'

const PrivateRoute = ({ children, requireAdmin = false }) => {
    // Lấy trạng thái login và quyền từ Redux Store
    const { isAuthenticated, isAdmin } = useSelector(state => state.auth);
    
    // Check
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    if (requireAdmin && !isAdmin) {
        message.error('Bạn không có quyền')
        return <Navigate to="/" replace />
    }
    return children;
};

export default PrivateRoute;