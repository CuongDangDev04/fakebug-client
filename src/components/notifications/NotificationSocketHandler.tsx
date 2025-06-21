'use client'
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import type Notification from '@/types/notification';
import { showNotificationToast } from './NotificationToast';
import { useRouter } from 'next/navigation';

export default function NotificationSocketHandler() {
    const router = useRouter();

    useNotificationSocket((notification: Notification) => {
        showNotificationToast({
            message: notification.message,
            url: notification.url ?? '/',
            avt: notification.avt ?? '/default-avatar.png',
            createdAt: notification.createdAt ?? '',
            navigate: (url) => router.push(url),
        });
    });

    return null;
}
