import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/user`;

export const userService = {
    async getPublicUserInfo(userId: number) {
        try {
            const response = await api.get(`${BASE_URL}/public/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Lỗi: ', error)
        }

    },
    
};
