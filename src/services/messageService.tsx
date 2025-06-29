import axiosInstance from '@/lib/axiosInstance';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/message`;

export const messageService = {
  async sendMessage(senderId: number, receiverId: number, content: string) {
    return axiosInstance.post(`${BASE_URL}/send`, { senderId, receiverId, content });
  },
  async getMessagesBetweenUsers(userId1: number, userId2: number) {
    return axiosInstance.get(`${BASE_URL}/between`, {
      params: { userId1, userId2 }
    });
  },
  async getLastSeen(userId: number) {
    const url = `${BASE_URL}/last-seen/${userId}`;
    const res = await axiosInstance.get(url);
    return res.data;
  }
};