import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/comments`;

export const commentService = {
  async createComment(postId: number, userId: number, content: string, parentId?: number) {
    try {
      const res = await api.post(`${BASE_URL}`, { postId, userId, content, parentId });
      return res.data;
    } catch (error: any) {
      console.error('Lỗi tạo bình luận:', error);
    }
  },

  async getCommentsByPost(postId: number) {
    try {
      const res = await api.get(`${BASE_URL}/post/${postId}`);
      return res.data;
    } catch (error: any) {
      console.error('Lỗi lấy danh sách bình luận:', error);
    }
  },

  async updateComment(commentId: number, content: string) {
    try {
      const res = await api.patch(`${BASE_URL}/${commentId}`, { content });
      return res.data;
    } catch (error: any) {
      console.error('Lỗi cập nhật bình luận:', error);
    }
  },

  async deleteComment(commentId: number) {
    try {
      const res = await api.delete(`${BASE_URL}/${commentId}`);
      return res.data;
    } catch (error: any) {
      console.error('Lỗi xóa bình luận:', error);
    }
  },

  async reactToComment(commentId: number, userId: number, type: string | null) {
    try {
      const res = await api.post(`${BASE_URL}/${commentId}/react`, { userId, type });
      return res.data;
    } catch (error: any) {
      console.error('Lỗi gửi reaction:', error);
    }
  },
};
