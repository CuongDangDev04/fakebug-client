import axiosInstance from '@/lib/axiosInstance';
import type { ProfileResponse } from '@/types/profile';

export const ProfileService = {
    async getProfile(): Promise<ProfileResponse | null> {
        try {
            const res = await axiosInstance.get<ProfileResponse>('/user/my-profile');
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
            const res = await axiosInstance.get<ProfileResponse>(`/user/profile/${userId}`);
            return res.data;
        }catch(error: any){
            console.error('Error:', error.message);console.error('Error:', error.message);
        }
    }
}