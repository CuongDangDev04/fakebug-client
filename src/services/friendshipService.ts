import api from '@/services/api';
import type { FriendshipStatus } from '@/types/friendship';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/friendships`;

export const friendshipService = {
    async sendFriendRequest(receiverId: number) {
        try {
            const res = await api.post(`${BASE_URL}/send-request/${receiverId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi gửi lời mời kết bạn:', error);
        }
    },

    async respondToRequest(requestId: number, accept: boolean) {
        try {
            const res = await api.post(`${BASE_URL}/respond/${requestId}`, { accept });
            return res.data;
        } catch (error: any) {
            console.error('Lỗi phản hồi lời mời:', error);
        }
    },

    async getFriends() {
        try {
            const res = await api.get(`${BASE_URL}/friends`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách bạn bè:', error);
        }
    },

    async unfriend(targetId: number) {
        try {
            const res = await api.delete(`${BASE_URL}/unfriend/${targetId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi hủy kết bạn:', error);
        }
    },

    async blockUser(targetId: number) {
        try {
            const res = await api.post(`${BASE_URL}/block/${targetId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi chặn người dùng:', error);
        }
    },

    async unblockUser(targetId: number) {
        try {
            const res = await api.delete(`${BASE_URL}/unblock/${targetId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi bỏ chặn người dùng:', error);
        }
    },

    async getReceivedRequests() {
        try {
            const res = await api.get(`${BASE_URL}/requests/received`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách lời mời đã nhận:', error);
        }
    },

    async getSentRequests() {
        try {
            const res = await api.get(`${BASE_URL}/requests/sent`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách lời mời đã gửi:', error);
        }
    },

    async cancelSentRequest(targetId: number) {
        try {
            const res = await api.delete(`${BASE_URL}/requests/cancel/${targetId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi hủy lời mời kết bạn:', error);
        }
    },

    async getMutualFriends(targetId: number) {
        try {
            const res = await api.get(`${BASE_URL}/mutual/${targetId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách bạn chung:', error);
        }
    },

    async getFriendSuggestions() {
        try {
            const res = await api.get(`${BASE_URL}/suggestions`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách gợi ý kết bạn:', error);
        }
    },

    async checkFriendshipStatus(targetId: number) {
        try {
            const res = await api.get<FriendshipStatus>(`${BASE_URL}/status/${targetId}`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi kiểm tra trạng thái kết bạn:', error);
        }
    },

    async getUserFriends(userId: number) {
        try {
            const res = await api.get(`${BASE_URL}/user/${userId}/friends`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách bạn của người dùng:', error);
        }
    },

    async getFriendshipStatusBatch(userIds: number[]) {
        try {
            const res = await api.post(`${BASE_URL}/status-batch`, { userIds });
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy trạng thái bạn bè theo danh sách:', error);
        }
    },

    async getBlockedUsers() {
        try {
            const res = await api.get(`${BASE_URL}/blocked`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách người bị chặn:', error);
        }
    },

    async getMyFriends() {
        try {
            const res = await api.get(`${BASE_URL}/my-friends`);
            return res.data;
        } catch (error: any) {
            console.error('Lỗi lấy danh sách bạn bè của chính mình:', error);
        }
    },
};
