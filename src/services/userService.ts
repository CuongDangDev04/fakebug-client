import api from '@/services/api';
import { UpdateUserProfilePayload, UpdateUserProfileResponse } from '@/types/user';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/user`;

export const userService = {
    async getPublicUserInfo(userId: number) {
        try {
            const response = await api.get(`${BASE_URL}/public/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Lỗi: ', error);
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
    }
};
