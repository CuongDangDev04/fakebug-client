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

  updateMessage: (msg) => {

    const currentUserId = useUserStore.getState().user?.id;
    const senderId = msg.sender?.id ?? msg.senderId ?? msg.friendId;
    const receiverId = msg.receiver?.id ?? msg.receiverId;
    const friendId = senderId === currentUserId ? receiverId : senderId;

    set((state) => {
      const prevFriends = state.friends;
      const index = prevFriends.findIndex((f) => f.friendId === friendId);

      const sentAt = msg.sent_at ?? msg.createdAt ?? new Date().toISOString();

      // Nếu là revoke
      if (msg.is_revoked) {
        if (index === -1) return {};

        const updated = [...prevFriends];
        updated[index] = {
          ...updated[index],
          content: msg.content,
          is_revoked: true,
          sent_at: sentAt,
          id: msg.id,
        };
        return { friends: updated };
      }

      // Trường hợp đã có tin nhắn với cùng ID, không update nữa
      if (index !== -1 && prevFriends[index].id === msg.id) {
        return {};
      }

      const updatedItem = {
        ...(index !== -1 ? prevFriends[index] : {}),
        id: msg.id,
        friendId,
        friendName:
          senderId === currentUserId
            ? (
              msg.receiver?.name ||
              `${msg.receiver?.first_name || ''} ${msg.receiver?.last_name || ''}`.trim()
            )
            : (
              msg.sender?.name ||
              `${msg.sender?.first_name || ''} ${msg.sender?.last_name || ''}`.trim()
            ) || 'Unknown',
        avatar_url:
          senderId === currentUserId
            ? msg.receiver?.avatar_url || ''
            : msg.sender?.avatar_url || '',

        content: msg.content,
        sent_at: sentAt,
        is_read: senderId === currentUserId,
        senderId,
        receiverId,
        unreadCount:
          senderId === currentUserId
            ? 0 // Nếu mình là người gửi thì không tính unread
            : (index !== -1 ? (prevFriends[index].unreadCount ?? 0) + 1 : 1),
        is_revoked: !!msg.is_revoked,
      };

      const newFriends = [
        updatedItem,
        ...prevFriends.filter((_, i) => i !== index),
      ];

      return { friends: newFriends };
    });
  },



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