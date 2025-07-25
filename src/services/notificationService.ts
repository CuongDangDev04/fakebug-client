import api from '@/services/api';
import type Notification from '@/types/notification';
const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/notifications`;
export const notificationService = {
    async getAllNotificationOfUser(offset = 0, limit = 10): Promise<{ total: number, notifications: Notification[] }> {
        try {
            const response = await api.get(`${BASE_URL}/all`, {
                params: { offset, limit },
            });
            return response.data;
        } catch (error: any) {
            console.error("Lỗi khi lấy thông báo", error);
            return { total: 0, notifications: [] };
        }
    }
    ,
    async sendNotification(userId: number, message: string, url: string, avt: string) {
        try {
            const response = await api.post(`${BASE_URL}/send`, { userId, message, url, avt })
            return response
        } catch (error: any) {
            console.error("Lỗi khi gửi thông báo");
        }
    },
    async deleteNotification(id: number) {
        try {
            const response = await api.delete(`${BASE_URL}/delete/${id}`)
            return response;
        } catch (error: any) {
            console.error(`Lỗi khi xoá thông báo với id: ${id}`)
        }
    },
    async markAsRead(id: number) {
        try {
            const response = await api.post(`${BASE_URL}/mark-read/${id}`);
            return response;
        } catch (error: any) {
            console.error(`Lỗi khi đánh dấu đã đọc thông báo với id: ${id}`);
        }
    },
    async markAllAsRead() {
        try {
            const response = await api.post(`${BASE_URL}/mark-all-read`);
            return response;
        } catch (error: any) {
            console.error('Lỗi khi đánh dấu tất cả thông báo là đã đọc');
        }
    },
    async getUnreadNotification() {
        try {
            const response = await api.get(`${BASE_URL}/unread`)
            console.log('response noti',response.data)
            return response.data;
        } catch (error: any) {
            console.error('Lỗi: ', error)
        }
    }
}