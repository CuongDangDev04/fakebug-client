import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export function useChatSocket() {
  const userId = useUserStore((state) => state.user?.id);
  const addMessage = useChatStore((state) => state.addMessage);
  const setUserLastSeen = useChatStore((state) => state.setUserLastSeen);
  const updateOnlineUserIds = useChatStore((state) => state.updateOnlineUserIds);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      query: { userId },
      withCredentials: true,
    });

    socketRef.current = socket;
    (window as any).chatSocket = socket; // để sử dụng socket toàn cục nếu cần

    socket.on('connect', () => {
      console.log('[ChatSocket] Connected:', socket.id);
    });

    socket.on('onlineUsers', (userIds: number[]) => {
      console.log('[ChatSocket] Online:', userIds);
      updateOnlineUserIds(() => userIds); // set trực tiếp mảng userIds mới
    });

    socket.on('userStatusChanged', (data: { userId: number; isOnline: boolean; lastSeen?: string }) => {
      console.log('[ChatSocket] userStatusChanged:', data);

      updateOnlineUserIds((prev) =>
        data.isOnline
          ? [...new Set([...prev, data.userId])]
          : prev.filter((id) => id !== data.userId)
      );

      if (data.isOnline) {
        setUserLastSeen(data.userId, null); // xóa lastSeen khi online
      } else if (data.lastSeen) {
        setUserLastSeen(data.userId, data.lastSeen); // lưu lại thời gian offline
      }
    });

    socket.on('newMessage', (msg: any) => {
      console.log('[ChatSocket] New msg:', msg);
      addMessage(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
