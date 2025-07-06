import { create } from 'zustand';
import { FriendsMessage } from '@/types/message';
import { useUserStore } from '@/stores/userStore';

interface FriendMessagesState {
  friends: FriendsMessage[];
  setFriends: (f: FriendsMessage[]) => void;
  updateMessage: (msg: any) => void;
  markAsRead: (friendId: number) => void;
  incrementUnreadCount: (friendId: number) => void;
}

export const useFriendMessagesStore = create<FriendMessagesState>((set, get) => ({
  friends: [],
  setFriends: (f) => set({ friends: f }),

  updateMessage: (msg) =>
    set((state) => {
      const currentUserId = useUserStore.getState().user?.id;
      const senderId = msg.sender?.id ?? msg.senderId ?? msg.friendId;
      const receiverId = msg.receiver?.id ?? msg.receiverId;

      // Nếu người gửi là mình → bỏ qua
      if (senderId === currentUserId) return {};

      const exists = state.friends.find((f) => f.friendId === senderId);

      if (exists) {
        const updated = state.friends
          .map((f) =>
            f.friendId === senderId
              ? {
                  ...f,
                  content: msg.content,
                  sent_at: msg.createdAt,
                  is_read: false,
                  unreadCount: (f.unreadCount ?? 0) + 1,
                }
              : f
          )
          .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

        return { friends: updated };
      } else {
        const newFriend: FriendsMessage = {
          id: msg.id,
          friendId: senderId,
          friendName: msg.sender?.name || 'Unknown',
          avatar_url: msg.sender?.avatar_url || '',
          content: msg.content,
          sent_at: msg.createdAt,
          is_read: false,
          senderId,
          receiverId,
          unreadCount: 1,
        };

        return { friends: [newFriend, ...state.friends] };
      }
    }),

  markAsRead: (friendId) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.friendId === friendId ? { ...f, is_read: true, unreadCount: 0 } : f
      ),
    })),

  incrementUnreadCount: (friendId) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.friendId === friendId
          ? { ...f, unreadCount: (f.unreadCount ?? 0) + 1, is_read: false }
          : f
      ),
    })),
}));
