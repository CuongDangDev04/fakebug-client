'use client'
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export const useCallSocket = (userId: number) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    console.log('[useCallSocket] Initializing socket for userId:', userId);

    const socket = io(`${SOCKET_URL}/call`, {
      query: { userId },
      withCredentials: true,
    });

    socketRef.current = socket;

    // ✅ Gán vào window để có thể dùng toàn cục
    (window as any).callSocket = socket;

    socket.on('connect', () => {
      console.log('📡 [CallSocket] Đã kết nối:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('📴 [CallSocket] Mất kết nối');
    });

    return () => {
      socket.disconnect();
      delete (window as any).callSocket;
    };
  }, [userId]);

  return socketRef;
};
