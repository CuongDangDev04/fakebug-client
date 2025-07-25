// hooks/useNotifications.ts
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import { useInfiniteScroll } from './useInfiniteScroll';
import type Notification from '@/types/notification';

export function useNotifications(limit = 10, filter?: 'all' | 'unread') {
  const router = useRouter();
  const storeNotifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const markAsReadStore = useNotificationStore((state) => state.markAsRead);

  const {
    items: fetchedNotifications,
    loading,
    hasMore,
    lastItemRef,
    removeItem,
  } = useInfiniteScroll<Notification>({
    fetchData: async (offset, limit) =>
      notificationService.getAllNotificationOfUser(offset, limit).then(res => res.notifications),
    limit,
  });

  const notifications = useMemo(() => {
    const combined = [...storeNotifications, ...fetchedNotifications];
    const map = new Map<number, Notification>();
    combined.forEach(n => map.set(n.id, n));
    let result = Array.from(map.values());

    if (filter === 'unread') {
      result = result.filter(n => !n.isRead);
    }

    return result.sort((a, b) => b.id - a.id);
  }, [storeNotifications, fetchedNotifications, filter]);

  const handleMarkAsRead = async (id: number, url?: string) => {
    try {
      await notificationService.markAsRead(id);
      markAsReadStore(id);
      if (url) router.push(url);
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      removeNotification(id);
      removeItem(id);
    } catch (error) {
      console.error('Lỗi xóa thông báo:', error);
    }
  };

  return {
    notifications,
    loading,
    hasMore,
    lastItemRef,
    handleMarkAsRead,
    handleDelete,
  };
}
