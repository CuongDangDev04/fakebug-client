import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/post-reactions`;

export const postReactionsService = {
    react(postId: number, userId: number, type: string) {
        return api.post(`${BASE_URL}/${postId}`, { userId, type });
    },

    removeReaction(postId: number, userId: number) {
        return api.delete(`${BASE_URL}/${postId}/${userId}`);
    }
};
