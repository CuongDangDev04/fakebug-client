import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/posts`;

export const postService = {
    async createPost(data: { content: string; userId: number; file?: File; privacy: 'public' | 'friends' | 'private' }) {
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('userId', data.userId.toString());
        formData.append('privacy', data.privacy);

        if (data.file) {
            formData.append('file', data.file);
        }

        return api.post(`${BASE_URL}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    async deletePost(postId: number | string) {
        try {
            return await api.delete(`${BASE_URL}/${postId}`);
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
            throw error;
        }
    },

    async updatePost(postId: number, data: FormData | {
        content: string;
        userId: number;
        file?: File;
        removeImage?: boolean;
        privacy: 'public' | 'friends' | 'private';
    }) {
        let formData: FormData;

        if (data instanceof FormData) {
            formData = data;
        } else {
            formData = new FormData();
            formData.append('content', data.content);
            formData.append('userId', data.userId.toString());
            formData.append('privacy', data.privacy);

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
    },

    async getPublicPosts() {
        try {
            const res = await api.get(`${BASE_URL}/public`);
            console.log('res dt', res)
            return res
        } catch (error) {
            console.error('Lỗi khi lấy bài viết công khai:', error);
            throw error;
        }
    },

    async getPrivatePosts() {
        try {
            return await api.get(`${BASE_URL}/private`);
        } catch (error) {
            console.error('Lỗi khi lấy bài viết riêng tư:', error);
            throw error;
        }
    },

    async getFriendPosts() {
        try {
            return await api.get(`${BASE_URL}/friends`);
        } catch (error) {
            console.error('Lỗi khi lấy bài viết bạn bè:', error);
            throw error;
        }
    },

    async getPostById(postId: number | string) {
        try {
            return await api.get(`${BASE_URL}/${postId}`);
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết bài viết:', error);
            throw error;
        }
    },
    async getAllVisiblePosts() {
        try {
            const res = await api.get(`${BASE_URL}/feed`);
            return res
        } catch (error) {
            console.error('Lỗi: ', error);
            throw error;
        }
    },
    async sharePost(postId: number | string, data: { content: string; privacy: 'public' | 'friends' | 'private' }) {
        try {
            const response = await api.post(`${BASE_URL}/${postId}/share`, data);
            console.log('response', response)
            return response.data;
        } catch (error) {
            console.error('Lỗi khi chia sẻ bài viết:', error);
            throw error;
        }
    },
async getPostMyUser(offset = 0, limit = 4) {
    try {
        console.log(`📡 Gọi API getPostMyUser với offset=${offset}, limit=${limit}`);
        const res = await api.get(`${BASE_URL}/mypost`, {
            params: { offset, limit }
        });
        console.log('📥 Dữ liệu getPostMyUser:', res.data);
        return res.data;
    } catch (error: any) {
        console.error('❌ Lỗi khi lấy bài viết người dùng:', error);
        throw error;
    }
}


};
