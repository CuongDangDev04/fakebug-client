import api from '@/services/api';
import type { ProfileResponse } from '@/types/profile';
const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/user`;

export const ProfileService = {
    async getProfile(): Promise<ProfileResponse | null> {
        try {
            const res = await api.get<ProfileResponse>(`${BASE_URL}/my-profile`);
            return res.data;
        } catch (error: any) {
            if (error.response) {
                console.error('Server error:', error.response.data);
            } else if (error.request) {
                console.error('Network error - Please check if the server is running');
            } else {
                console.error('Error:', error.message);
            }
            return null;
        }
    },
    async getOtherUserProfile(userId: string | undefined) {
        try {
            const res = await api.get<ProfileResponse>(`${BASE_URL}profile/${userId}`);
            return res.data;
        } catch (error: any) {
            console.error('Error:', error.message); console.error('Error:', error.message);
        }
    },
    async uploadAvatar(file: File, userId: number) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', String(userId));

        const response = await api.post(`${BASE_URL}/upload-avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data;
    },

    async uploadCover(file: File, userId: number) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', String(userId));

        const response = await api.post(`${BASE_URL}/upload-cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data;
    },
}