

import axios from 'axios';
import Cookies from 'js-cookie';

// Tạo một instance axios có cấu hình sẵn
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL, // Base URL của API
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Không gửi cookie qua cross-origin nếu không cần
});

// Interceptor request: Gắn access_token vào header Authorization
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');  
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Gắn vào header
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Cờ đánh dấu xem có đang làm mới token không
let isRefreshing = false;

// Hàng đợi các request đang chờ token mới
let failedQueue: any[] = [];

// Hàm xử lý lại các request khi token mới có hoặc bị lỗi
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            // Nếu có token mới → gửi lại request cũ với token mới
            prom.resolve(token);
        } else {
            // Nếu bị lỗi → reject các request cũ
            prom.reject(error);
        }
    });
    failedQueue = [];
};

// Interceptor response: xử lý lỗi từ response trả về
api.interceptors.response.use(
    (response) => response, // Nếu response OK → return luôn
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (token hết hạn) và chưa retry thì xử lý
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Nếu đang trong quá trình refresh → xếp request này vào hàng đợi
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = 'Bearer ' + token;
                            resolve(api(originalRequest)); // Gửi lại request cũ với token mới
                        },
                        reject: (err: any) => reject(err),
                    });
                });
            }

            // Nếu chưa refresh → bắt đầu refresh
            isRefreshing = true;

            const refreshToken = Cookies.get('refresh_token'); // Lấy refresh_token từ cookie

            try {
                // Gửi yêu cầu refresh token
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh-token`,
                    { refresh_token: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const newToken = response.data.access_token;

                // Lưu token mới vào cookie
                Cookies.set('access_token', newToken, { expires: 7, path: '/' });

                // Gắn lại token vào các request mặc định
                api.defaults.headers.Authorization = 'Bearer ' + newToken;
                originalRequest.headers.Authorization = 'Bearer ' + newToken;

                // Gửi lại các request trong hàng đợi
                processQueue(null, newToken);

                // Gửi lại request cũ đã bị lỗi 401
                return api(originalRequest);
            } catch (err) {
                // Nếu refresh thất bại → xóa token, logout
                processQueue(err, null);
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                window.location.href = '/dang-nhap';  
                return Promise.reject(err);
            } finally {
                isRefreshing = false; // Reset lại flag
            }
        }

        // Nếu không phải lỗi 401 hoặc không xử lý được → trả lỗi
        return Promise.reject(error);
    }
);

export default api;
