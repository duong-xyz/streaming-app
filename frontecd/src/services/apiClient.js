import axios from 'axios'

const apiClient = axios.create({
    // baseURL: 'https://streaming-app-gukm.onrender.com/api/v1',
    baseURL: 'http://localhost:8080/api/v1',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {

    // Nếu đường dẫn gọi API chứa cụm từ 'login' hoặc 'register', tuyệt đối KHÔNG chèn token
    if (config.url.includes('/users/login') || config.url.includes('/users/register')) {
        return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// apiClient.js
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (!error.response) {
            console.error("LỖI KẾT NỐI: Máy chủ Spring Boot chưa được kích hoạt hoặc bị sập mạng!");

            // dùng Promise.reject để chặn không cho code chạy tiếp vào khối try{}
            return Promise.reject(new Error("Không thể kết nối tới máy chủ Backend. Vui lòng kiểm tra lại server!"));
        }
        const { status } = error.response;
        const isCommentApi = error.config?.url?.includes('/comments');
        
        if (status === 401) {
            console.warn("Phiên làm việc đã hết hạn hoặc không hợp lệ. Đang tự động đăng xuất...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!isCommentApi) window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);


export default apiClient;