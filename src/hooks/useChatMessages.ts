// hooks/useChatMessages.ts
import { useEffect, useState } from 'react';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/stores/chatStore';

export function useChatMessages(currentUserId: number, targetUserId: number) {
    const [loading, setLoading] = useState(false);
    const allMessages = useChatStore((state) => state.messages);
    const filteredMessages = allMessages.filter(
        (msg) =>
            (msg.sender.id === currentUserId && msg.receiver.id === targetUserId) ||
            (msg.sender.id === targetUserId && msg.receiver.id === currentUserId)
    );

    const setMessages = useChatStore((state) => state.clearMessages);
    const addMessage = useChatStore((state) => state.addMessage);

    useEffect(() => {
        loadMessages();
        return () => {
            setMessages(); // clear messages khi rời đi
        };
    }, [currentUserId, targetUserId]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await messageService.getMessagesBetweenUsers(currentUserId, targetUserId);
            // res.data là mảng tin nhắn
            res.data.forEach((msg: any) => addMessage(msg));
        } catch (err) {
            console.error("Lỗi tải messages:", err);
        } finally {
            setLoading(false);
        }
    };

    return { messages: filteredMessages, loading };
}
