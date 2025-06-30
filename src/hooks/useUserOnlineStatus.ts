import { useChatStore } from '@/stores/chatStore';
import { useEffect } from 'react';
import { messageService } from '@/services/messageService';

export function useUserOnlineStatus(userId: number) {
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);
  const userLastSeenMap = useChatStore((state) => state.userLastSeenMap);
  const setUserLastSeen = useChatStore((state) => state.setUserLastSeen);

  const isOnline = onlineUserIds.includes(userId);
  const lastSeen = userLastSeenMap[userId];

  useEffect(() => {
    if (!isOnline && !lastSeen) {
      messageService
        .getLastSeen(userId)
        .then((data) => {
          if (data.lastSeen) {
            setUserLastSeen(userId, data.lastSeen);
          }
        })
        .catch((err) => {
          console.error('Lỗi lấy lastSeen:', err);
        });
    }
  }, [isOnline, lastSeen, userId]);

  // Format thời gian offline
  const formatLastSeen = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins <= 0) return 'Online 1 phút trước';
    if (mins < 60) return `Online ${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Online ${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `Offline ${days} ngày trước`;
  };

  return { isOnline, lastSeen, formatLastSeen };
}
