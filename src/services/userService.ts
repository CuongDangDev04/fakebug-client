import api from '@/services/api';
import { UpdateUserProfilePayload, UpdateUserProfileResponse } from '@/types/user';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/user`;

export const userService = {
    async getPublicUserInfo(userId: number) {
        try {
            const response = await api.get(`${BASE_URL}/public/${userId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async searchUsers(query: string, page = 1, limit = 10) {
        try {
            const response = await api.get(`${BASE_URL}/search`, {
                params: {
                    q: query,
                    page,
                    limit,
                },
            });
            return response.data;
        } catch (error: any) {
            console.error('Lỗi tìm kiếm user: ', error);
            return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
        }
    },

    async updateProfile(data: UpdateUserProfilePayload): Promise<UpdateUserProfileResponse> {
        try {
            const response = await api.put(`${BASE_URL}/me`, data);
            return response.data;
        } catch (error: any) {
            console.error('Lỗi cập nhật profile: ', error);
            throw error;
        }
    },

    async getUsersByRole(role: 'user' | 'admin', page = 1, limit = 10) {
        try {
            const res = await api.get(`${BASE_URL}/role/${role}`, {
                params: { page, limit },
            });
            return res.data; // { users, total, page, totalPages, limit }
        } catch (error: any) {
            console.error('Lỗi lấy danh sách users: ', error);
            return { users: [], total: 0, page: 1, totalPages: 1 };
        }
    },


    async toggleUserStatus(userId: number, disable: boolean) {
        try {
            const res = await api.put(`${BASE_URL}/${userId}/status`, undefined, {
                params: { disable: String(disable) },
            });
            return res.data;
        } catch (error: any) {
            console.error('Lỗi thay đổi trạng thái user: ', error);
            throw error;
        }
    },
    async countUsers() {
        try {
            const res = await api.get(`${BASE_URL}/count`);
            return res.data.count; // giả sử API trả về { count: number }
        } catch (error: any) {
            console.error('Lỗi lấy tổng số lượng user:', error);
            return 0;
        }
    }

};
