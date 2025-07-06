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
      let friendId: number;
      if (senderId === currentUserId) {
        friendId = receiverId;
      } else {
        friendId = senderId;
      }

      // Nếu là message revoke, tìm đúng bạn bè có message cuối cùng là message này
      if (msg.is_revoked) {
        const updated = state.friends.map((f) => {
          if (f.id === msg.id) {
            return {
              ...f,
              content: msg.content,
              is_revoked: true,
              // Nếu có các trường khác từ msg thì cập nhật luôn
              sent_at: msg.sent_at || f.sent_at,
              senderId: msg.senderId || f.senderId,
              receiverId: msg.receiverId || f.receiverId,
            };
          }
          return f;
        });
        return { friends: updated };
      }

      // Nếu người gửi là mình → bỏ qua (trừ trường hợp revoke)
      if (senderId === currentUserId) return {};

      const exists = state.friends.find((f) => f.friendId === friendId);

      if (exists) {
        const updated = state.friends
          .map((f) =>
            f.friendId === friendId
              ? {
                  ...f,
                  content: msg.content,
                  sent_at: msg.createdAt,
                  is_read: false,
                  unreadCount: (f.unreadCount ?? 0) + 1,
                  id: msg.id,
                  is_revoked: !!msg.is_revoked,
                }
              : f
          )
          .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

        return { friends: updated };
      } else {
        const newFriend: FriendsMessage = {
          id: msg.id,
          friendId: friendId,
          friendName: msg.sender?.name || msg.sender?.first_name + ' ' + msg.sender?.last_name || 'Unknown',
          avatar_url: msg.sender?.avatar_url || '',
          content: msg.content,
          sent_at: msg.createdAt,
          is_read: false,
          senderId,
          receiverId,
          unreadCount: 1,
          is_revoked: !!msg.is_revoked
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