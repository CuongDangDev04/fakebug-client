import api from '@/services/api';
import type { FriendshipStatus } from '@/types/friendship';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/friendships`;

export const friendshipService = {
    // Gửi lời mời kết bạn
    async sendFriendRequest(receiverId: number) {
        return api.post(`${BASE_URL}/send-request/${receiverId}`);
    },

    // Phản hồi lời mời kết bạn
    async respondToRequest(requestId: number, accept: boolean) {
        return api.post(`${BASE_URL}/respond/${requestId}`, { accept });
    },

    // Lấy danh sách bạn bè
    async getFriends() {
        return api.get(`${BASE_URL}/friends`);
    },

    // Hủy kết bạn
    async unfriend(targetId: number) {
        return api.delete(`${BASE_URL}/unfriend/${targetId}`);
    },

    // Chặn người dùng
    async blockUser(targetId: number) {
        return api.post(`${BASE_URL}/block/${targetId}`);
    },

    // Bỏ chặn người dùng
    async unblockUser(targetId: number) {
        return api.delete(`${BASE_URL}/unblock/${targetId}`);
    },

    // Lấy danh sách lời mời kết bạn đã nhận
    async getReceivedRequests() {
        return api.get(`${BASE_URL}/requests/received`);
    },

    // Lấy danh sách lời mời kết bạn đã gửi
    async getSentRequests() {
        return api.get(`${BASE_URL}/requests/sent`);
    },

    // Hủy lời mời kết bạn đã gửi
    async cancelSentRequest(targetId: number) {
        return api.delete(`${BASE_URL}/requests/cancel/${targetId}`);
    },

    //lấy danh sách bạn chung
    async getMutualFriends(targetId: number) {
        return api.get(`${BASE_URL}/mutual/${targetId}`);
    },

    //gợi ý kết bạn dựa vào bạn chung
    async getFriendSuggestions() {
        return api.get(`${BASE_URL}/suggestions`);
    },

    // Kiểm tra trạng thái kết bạn
    async checkFriendshipStatus(targetId: number) {
        return api.get<FriendshipStatus>(`${BASE_URL}/status/${targetId}`);
    },

    // Lấy danh sách bạn bè của một user cụ thể
    async getUserFriends(userId: number) {
        return api.get(`${BASE_URL}/user/${userId}/friends`);
    },

    // Lấy thông tin chi tiết về mối quan hệ với một danh sách users
    async getFriendshipStatusBatch(userIds: number[]) {
        return api.post(`${BASE_URL}/status-batch`, { userIds });
    },

    // Lấy danh sách user bị chặn
    async getBlockedUsers() {
        return api.get(`${BASE_URL}/blocked`);
    }
};