import { useNotificationStore } from '@/stores/notificationStore';
import type Notification from '@/types/notification';
import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';
import { useFriendStore } from '@/stores/friendStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';


export function useNotificationSocket(
    onNewNotification?: (notification: Notification) => void
) {
    const userId = useUserStore((state) => state.user?.id);

    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        if (!userId) return;

        const socket: Socket = io(`${SOCKET_URL}/notifications`);

        socket.on('connect', () => {
            console.log('Connected to WebSocket:', socket.id);
            socket.emit('subscribeToUserNotifications', userId);
        });

        socket.on('newNotification', (notification: Notification) => {
            console.log('Received notification from socket:', notification);
            addNotification(notification);
            if (onNewNotification) onNewNotification(notification);
            useFriendStore.getState().resetHasLoaded();

        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        return () => {
            socket.disconnect();
        };
    }, [userId, addNotification, onNewNotification]);
}
