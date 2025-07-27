import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/message`;

export const messageService = {
  async sendMessage(senderId: number, receiverId: number, content: string) {
    return api.post(`${BASE_URL}/send`, { senderId, receiverId, content });
  },

  async getMessagesBetweenUsers(userId1: number, userId2: number, limit = 10, offset = 0) {
    return api.get(`${BASE_URL}/between`, {
      params: { userId1, userId2, limit, offset }
    });
  },

  async getLastSeen(userId: number) {
    const url = `${BASE_URL}/last-seen/${userId}`;
    const res = await api.get(url);
    return res.data;
  },

  async getFriendMessages() {
    try {
      const response = await api.get(`${BASE_URL}/friend-messages`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching friend messages:', error);
    }
  },

  async markAsRead(friendId: number) {
    try {
      const res = await api.put(`${BASE_URL}/mark-as-read/${friendId}`);
      return res;
    } catch (error: any) {
      console.error('Lỗi khi đọc tin nhắn: ', error)
    }
  },

  async getTotalUnreadCount() {
    try {
      const response = await api.get(`${BASE_URL}/total-unread`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching total unread count:', error);
      return { totalUnreadCount: 0 };
    }
  },
  async deleteMessageForMe(messageId: number) {
    try {
      const res = await api.put(`${BASE_URL}/delete-for-me/${messageId}`);
      return res.data;
    }
    catch (error: any) {
      console.error('Lỗi: ', error)
    }
  },
  async deleteConversation(otherUserId: number) {
    try {
      const res = await api.put(`${BASE_URL}/delete-conversation/${otherUserId}`);
      return res.data;
    } catch (error: any) {
      console.error('Lỗi khi xoá cuộc trò chuyện:', error);
    }
  }
};
