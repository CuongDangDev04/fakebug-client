// src/stores/friendStore.ts
import { create } from 'zustand';
import { friendshipService } from '@/services/friendshipService';

export interface Friend {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    mutualFriendsCount?: number;
}

interface FriendStore {
    friends: Friend[];
    receivedRequests: any[];
    sentRequests: any[];
    suggestions: Friend[];
    blockedUsers: Friend[];
    loading: boolean;
    hasLoaded: boolean;

    loadFriends: () => Promise<void>;
    loadReceivedRequests: () => Promise<void>;
    loadSentRequests: () => Promise<void>;
    loadSuggestions: () => Promise<void>;
    loadBlockedUsers: () => Promise<void>;
    
    setFriends: (friends: Friend[]) => void;
    setReceivedRequests: (requests: any[]) => void;
    setSentRequests: (requests: any[]) => void;
    setSuggestions: (suggestions: Friend[]) => void;
    setBlockedUsers: (users: Friend[]) => void;
    resetHasLoaded: () => void; // thêm hàm reset
}

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
            console.log('[FriendStore] loadFriends skipped because hasLoaded=true');
            return;
        }

        console.log('[FriendStore] loadFriends called');
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
            console.log('[FriendStore] loadFriends success:', friendsWithMutual.length, 'friends loaded');
        } catch (error) {
            console.error('[FriendStore] loadFriends error:', error);
            set({ friends: [], loading: false });
        }
    },

    loadReceivedRequests: async () => {
        console.log('[FriendStore] loadReceivedRequests called');
        set({ loading: true });
        try {
            const res = await friendshipService.getReceivedRequests();
            const requests = res?.data.requests || [];
            set({ receivedRequests: requests, loading: false });
            console.log('[FriendStore] loadReceivedRequests success:', requests.length, 'requests loaded');
        } catch (error) {
            console.error('[FriendStore] loadReceivedRequests error:', error);
            set({ receivedRequests: [], loading: false });
        }
    },

    loadSentRequests: async () => {
        console.log('[FriendStore] loadSentRequests called');
        set({ loading: true });
        try {
            const res = await friendshipService.getSentRequests();
            set({ sentRequests: res?.data.requests || [], loading: false });
            console.log('[FriendStore] loadSentRequests success:', (res?.data.requests || []).length, 'requests loaded');
        } catch (error) {
            console.error('[FriendStore] loadSentRequests error:', error);
            set({ sentRequests: [], loading: false });
        }
    },

    loadSuggestions: async () => {
        console.log('[FriendStore] loadSuggestions called');
        set({ loading: true });
        try {
            const res = await friendshipService.getFriendSuggestions();
            set({ suggestions: res?.data.suggestions || [], loading: false });
            console.log('[FriendStore] loadSuggestions success:', (res?.data.suggestions || []).length, 'suggestions loaded');
        } catch (error) {
            console.error('[FriendStore] loadSuggestions error:', error);
            set({ suggestions: [], loading: false });
        }
    },

    loadBlockedUsers: async () => {
        console.log('[FriendStore] loadBlockedUsers called');
        set({ loading: true });
        try {
            const res = await friendshipService.getBlockedUsers();
            set({ blockedUsers: res?.data.blocked || [], loading: false });
            console.log('[FriendStore] loadBlockedUsers success:', (res?.data.blocked || []).length, 'blocked users loaded');
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
