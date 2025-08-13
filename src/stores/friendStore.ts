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

  // HasLoaded riêng cho từng dữ liệu
  hasLoadedFriends: false,
  hasLoadedReceivedRequests: false,
  hasLoadedSentRequests: false,
  hasLoadedSuggestions: false,
  hasLoadedBlockedUsers: false,

  // Load friends
  loadFriends: async () => {
    if (get().hasLoadedFriends) return;
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
      set({ friends: friendsWithMutual, loading: false, hasLoadedFriends: true });
    } catch (error) {
      console.error('[FriendStore] loadFriends error:', error);
      set({ friends: [], loading: false });
    }
  },

  loadReceivedRequests: async () => {
    if (get().hasLoadedReceivedRequests) return;
    set({ loading: true });
    try {
      const res = await friendshipService.getReceivedRequests();
      const requests = res?.data.requests || [];
      set({ receivedRequests: requests, loading: false, hasLoadedReceivedRequests: true });
    } catch (error) {
      console.error('[FriendStore] loadReceivedRequests error:', error);
      set({ receivedRequests: [], loading: false });
    }
  },

  loadSentRequests: async () => {
    if (get().hasLoadedSentRequests) return;
    set({ loading: true });
    try {
      const res = await friendshipService.getSentRequests();
      set({ sentRequests: res?.data.requests || [], loading: false, hasLoadedSentRequests: true });
    } catch (error) {
      console.error('[FriendStore] loadSentRequests error:', error);
      set({ sentRequests: [], loading: false });
    }
  },

  loadSuggestions: async () => {
    if (get().hasLoadedSuggestions) return;
    set({ loading: true });
    try {
      const res = await friendshipService.getFriendSuggestions();
      set({ suggestions: res?.data.suggestions || [], loading: false, hasLoadedSuggestions: true });
    } catch (error) {
      console.error('[FriendStore] loadSuggestions error:', error);
      set({ suggestions: [], loading: false });
    }
  },

  loadBlockedUsers: async () => {
    if (get().hasLoadedBlockedUsers) return;
    set({ loading: true });
    try {
      const res = await friendshipService.getBlockedUsers();
      set({ blockedUsers: res?.data.blocked || [], loading: false, hasLoadedBlockedUsers: true });
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

  resetHasLoadedFriends: () => set({ hasLoadedFriends: false }),
  resetHasLoadedReceivedRequests: () => set({ hasLoadedReceivedRequests: false }),
  resetHasLoadedSentRequests: () => set({ hasLoadedSentRequests: false }),
  resetHasLoadedSuggestions: () => set({ hasLoadedSuggestions: false }),
  resetHasLoadedBlockedUsers: () => set({ hasLoadedBlockedUsers: false }),
}));
