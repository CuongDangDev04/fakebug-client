'use client'
import { messageService } from "@/services/messageService";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function useChatMessages(currentUserId: number, targetUserId: number) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!currentUserId || !targetUserId) {
            return;
        }

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        const socket = io(
            (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000') + '/chat',
            {
                query: { userId: currentUserId },
                withCredentials: true,
            }
        );
        socketRef.current = socket;

        const handleNewMessage = (msg: any) => {
            try {
                if (
                    (msg.sender.id === targetUserId && msg.receiver.id === currentUserId) ||
                    (msg.sender.id === currentUserId && msg.receiver.id === targetUserId)
                ) {
                    setMessages(prev => [...prev, msg]);
                }
            } catch (err) {
                console.error("❌ Lỗi xử lý newMessage:", err, msg);
            }
        };

        const handleMessageSent = (msg: any) => {
            try {
                if (
                    msg.sender.id === currentUserId &&
                    msg.receiver.id === targetUserId
                ) {
                    setMessages(prev => [...prev, msg]);
                }
            } catch (err) {
                console.error("❌ Lỗi xử lý messageSent:", err, msg);
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageSent', handleMessageSent);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageSent', handleMessageSent);
            socket.disconnect();
        };
    }, [currentUserId, targetUserId]);  

    useEffect(() => {
        if (currentUserId && targetUserId) {
            loadMessages();
        }
    }, [currentUserId, targetUserId]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await messageService.getMessagesBetweenUsers(currentUserId, targetUserId);
            setMessages(res.data);
        } catch (err) {
            console.error("❌ Lỗi load tin nhắn:", err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = (input: string) => {
        if (!input.trim() || !socketRef.current) {
            return;
        }

        try {
            socketRef.current.emit('sendMessage', {
                senderId: currentUserId,
                receiverId: targetUserId,
                content: input,
            });
        } catch (err) {
            console.error("❌ Lỗi khi emit sendMessage:", err);
        }
    };

    return { messages, loading, setMessages, sendMessage };
}
