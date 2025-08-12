// src/stores/friendStore.ts
import { create } from 'zustand';
import { friendshipService } from '@/services/friendshipService';
import { Friend, FriendStore } from '@/types/friendStoreType';


export const useFriendStore = create<FriendStore>((set, get) => ({
    friends: [],
    receivedRequests: [],
    sentRequests: [],
    suggestions: [],
    blockedUsers: [],
    loading: false,
    hasLoaded: false,

    loadFriends: async () => {
        if (get().hasLoaded) {
            return;
        }

        set({ loading: true });
        try {
            const res = await friendshipService.getFriends();
            const friendsData = res?.data.friends || [];

            const friendsWithMutual = await Promise.all(
                friendsData.map(async (friend: Friend) => {
                    const mutualRes = await friendshipService.getMutualFriends(friend.id);
                    return {
                        ...friend,
                        mutualFriendsCount: mutualRes?.data.total || 0,
                    };
                })
            );

            set({ friends: friendsWithMutual, loading: false, hasLoaded: true });
        } catch (error) {
            console.error('[FriendStore] loadFriends error:', error);
            set({ friends: [], loading: false });
        }
    },

    loadReceivedRequests: async () => {
        set({ loading: true });
        try {
            const res = await friendshipService.getReceivedRequests();
            const requests = res?.data.requests || [];
            set({ receivedRequests: requests, loading: false });
        } catch (error) {
            console.error('[FriendStore] loadReceivedRequests error:', error);
            set({ receivedRequests: [], loading: false });
        }
    },

    loadSentRequests: async () => {
        set({ loading: true });
        try {
            const res = await friendshipService.getSentRequests();
            set({ sentRequests: res?.data.requests || [], loading: false });
        } catch (error) {
            console.error('[FriendStore] loadSentRequests error:', error);
            set({ sentRequests: [], loading: false });
        }
    },

    loadSuggestions: async () => {
        set({ loading: true });
        try {
            const res = await friendshipService.getFriendSuggestions();
            set({ suggestions: res?.data.suggestions || [], loading: false });
        } catch (error) {
            console.error('[FriendStore] loadSuggestions error:', error);
            set({ suggestions: [], loading: false });
        }
    },

    loadBlockedUsers: async () => {
        set({ loading: true });
        try {
            const res = await friendshipService.getBlockedUsers();
            set({ blockedUsers: res?.data.blocked || [], loading: false });
        } catch (error) {
            console.error('[FriendStore] loadBlockedUsers error:', error);
            set({ blockedUsers: [], loading: false });
        }
    },

    setFriends: (friends) => set({ friends }),
    setReceivedRequests: (receivedRequests) => set({ receivedRequests }),
    setSentRequests: (sentRequests) => set({ sentRequests }),
    setSuggestions: (suggestions) => set({ suggestions }),
    setBlockedUsers: (blockedUsers) => set({ blockedUsers }),

    resetHasLoaded: () => set({ hasLoaded: false }),
}));
