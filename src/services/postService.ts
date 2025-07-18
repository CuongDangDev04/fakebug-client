import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/posts`;

export const postService = {
    async createPost(data: { content: string; userId: number; file?: File }) {
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('userId', data.userId.toString());
        if (data.file) {
            formData.append('file', data.file);
        }

        return api.post(`${BASE_URL}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    async getMyPosts() {
        return api.get(`${BASE_URL}/my`);
    },

    async getUserPosts(userId: number | string) {
        return api.get(`${BASE_URL}/user/${userId}`);
    },

    async deletePost(postId: number | string) {
        return api.delete(`${BASE_URL}/${postId}`);
    },
    async getAllPosts() {
        return api.get(`${BASE_URL}`);
    },
   async updatePost(postId: number, data: FormData | {
    content: string;
    userId: number;
    file?: File;
    removeImage?: boolean;
}) {
    let formData: FormData;

    if (data instanceof FormData) {
        formData = data;  // Nếu đã là FormData thì dùng luôn
    } else {
        formData = new FormData();
        formData.append('content', data.content);
        formData.append('userId', data.userId.toString());
        if (data.file) {
            formData.append('file', data.file);
        }
        if (data.removeImage) {
            formData.append('removeImage', 'true');
        }
    }

    return api.put(`${BASE_URL}/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}





};
