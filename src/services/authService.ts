// authService.ts
import api from '@/services/api';
import type { RegisterUserDto, LoginUserDto, AuthResponse, ForgotPasswordDto, ResetPasswordDto, ResetPasswordResponse, ForgotPasswordResponse } from '@/types/auth';
import type { User } from '@/types/profile';
import { cookieService } from './cookieService';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const authService = {
    async registerLocal(data: RegisterUserDto): Promise<AuthResponse> {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await res.json();
    },

    async loginLocal(data: LoginUserDto): Promise<AuthResponse> {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await res.json();
    },

    async logout(): Promise<{ message: string }> {

        const response = await api.post(`${BASE_URL}/auth/logout`);

        cookieService.removeAccessToken();
        cookieService.removeRefreshToken();

        delete api.defaults.headers.common['Authorization'];

        return response.data;
    },

    async forgotPassword(data: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
        const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await res.json();
    },

    async resetPassword(data: ResetPasswordDto): Promise<ResetPasswordResponse> {
        const res = await fetch(`${BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await res.json();
    },

    async loginWithGoogle(): Promise<void> {
        window.location.href = `${BASE_URL}/auth/google`;
    },

    async handleGoogleRedirect(): Promise<AuthResponse> {
        try {
            const res = await fetch(`${BASE_URL}/auth/google/redirect`);

            if (!res.ok) {
                // Lấy nội dung lỗi từ backend
                const errorData = await res.json();
                throw new Error(errorData.message || 'Có lỗi xảy ra');
            }

            return await res.json();

        } catch (err: any) {
            // Tùy UI mà xử lý
            alert(err.message); // hoặc toast, modal...
            throw err; // nếu muốn phía gọi service biết lỗi
        }
    },


    async getInfoUser(): Promise<User | undefined> {
        try {
            // Sử dụng cookieService để kiểm tra token
            const token = cookieService.getAccessToken();
            if (!token) {
                return undefined;
            }

            const response = await api.get(`${BASE_URL}/user/getInfo-user`);
            if (response.data && response.data.user) {
                return response.data.user;
            }
            return undefined;
        }
        catch (error: any) {
            if (error.response?.status === 401) {
                cookieService.removeAccessToken();
            }
            return undefined;
        }
    }
};
