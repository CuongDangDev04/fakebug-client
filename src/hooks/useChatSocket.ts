import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { useFriendMessagesStore } from '@/stores/friendMessagesStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export function useChatSocket() {
  const userId = useUserStore((state) => state.user?.id);

  const addMessage = useChatStore((state) => state.addMessage);
  const setUserLastSeen = useChatStore((state) => state.setUserLastSeen);
  const updateOnlineUserIds = useChatStore((state) => state.updateOnlineUserIds);
  const markMessagesAsReadFromUser = useChatStore.getState().markMessagesAsReadFromUser;
  const setUserHasReadMyMessages = (userId: number, myUserId: number) =>
    useChatStore.getState().setUserHasReadMyMessages(userId, myUserId);

  const updateFriendMessage = useFriendMessagesStore.getState().updateMessage;

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      query: { userId },
      withCredentials: true,
    });

    socketRef.current = socket;
    (window as any).chatSocket = socket;

    socket.on('connect', () => {
    });

    socket.on('onlineUsers', (userIds: number[]) => {
      updateOnlineUserIds(() => userIds);
    });

    socket.on('userStatusChanged', (data: { userId: number; isOnline: boolean; lastSeen?: string }) => {

      updateOnlineUserIds((prev) =>
        data.isOnline
          ? [...new Set([...prev, data.userId])]
          : prev.filter((id) => id !== data.userId)
      );

      if (data.isOnline) {
        setUserLastSeen(data.userId, null);
      } else if (data.lastSeen) {
        setUserLastSeen(data.userId, data.lastSeen);
      }
    });

    socket.on('newMessage', (msg: any) => {
      addMessage(msg);                // cập nhật chi tiết trong ChatBox
      updateFriendMessage(msg);       // cập nhật danh sách trong Sidebar
    });

    socket.on('message-read', (data: { from: number }) => {
      markMessagesAsReadFromUser(data.from);
      setUserHasReadMyMessages(data.from, userId);
    });

    socket.on('messageRevoked', ({ messageId }: { messageId: number }) => {

      // Cập nhật lại message trong ChatBox
      addMessage({
        id: messageId,
        content: 'Tin nhắn đã được thu hồi',
        is_revoked: true,
      } as any); // ép kiểu nếu chưa đủ field

      // Cập nhật Sidebar nếu cần
      updateFriendMessage({
        id: messageId,
        content: 'Tin nhắn đã được thu hồi',
        is_revoked: true,
      });

      // DEBUG: log lại toàn bộ messages sau khi revoke
      setTimeout(() => {
      }, 100);
    });

    socket.on('reactionUpdated', (updatedMessage: any) => {

      // Cập nhật trong ChatBox
      addMessage(updatedMessage);

      // Cập nhật trong danh sách bạn bè (nếu cần)
      updateFriendMessage(updatedMessage);
    });



    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [userId]);
}
