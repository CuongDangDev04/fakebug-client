import axiosInstance from '@/lib/axiosInstance';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/message`;

export const messageService = {
  async sendMessage(senderId: number, receiverId: number, content: string) {
    return axiosInstance.post(`${BASE_URL}/send`, { senderId, receiverId, content });
  },

  async getMessagesBetweenUsers(userId1: number, userId2: number, limit = 10, offset = 0) {
    return axiosInstance.get(`${BASE_URL}/between`, {
      params: { userId1, userId2, limit, offset }
    });
  },

  async getLastSeen(userId: number) {
    const url = `${BASE_URL}/last-seen/${userId}`;
    const res = await axiosInstance.get(url);
    return res.data;
  },

  async getFriendMessages() {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/friend-messages`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching friend messages:', error);
    }
  },

  async markAsRead(friendId: number) {
    try {
      const res = await axiosInstance.put(`${BASE_URL}/mark-as-read/${friendId}`);
      return res;
    } catch (error: any) {
      console.error('Lỗi khi đọc tin nhắn: ', error)
    }
  }
};
