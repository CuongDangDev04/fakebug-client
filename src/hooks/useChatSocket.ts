// hooks/useChatSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export function useChatSocket() {
    const userId = useUserStore((state) => state.user?.id);
    const setOnlineUserIds = useChatStore((state) => state.setOnlineUserIds);
    const addMessage = useChatStore((state) => state.addMessage);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        const socket = io(`${SOCKET_URL}/chat`, {
            query: { userId },
            withCredentials: true,
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[ChatSocket] Connected:', socket.id);
        });

        socket.on('onlineUsers', (userIds: number[]) => {
            console.log('[ChatSocket] Online:', userIds);
            setOnlineUserIds(userIds);
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
