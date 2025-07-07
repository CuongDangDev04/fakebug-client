import { useEffect, useState } from 'react';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/stores/chatStore';

export function useChatMessages(currentUserId: number, targetUserId: number) {
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const allMessages = useChatStore((state) => state.messages);
  const filteredMessages = allMessages.filter(
    (msg) =>
      (msg.sender.id === currentUserId && msg.receiver.id === targetUserId) ||
      (msg.sender.id === targetUserId && msg.receiver.id === currentUserId)
  );

  const clearMessages = useChatStore((state) => state.clearMessages);
  const addMessages = useChatStore((state) => state.addMessages);

  useEffect(() => {
    clearMessages();
    setOffset(0);
    setHasMore(true);
    loadMessages(0);
  }, [currentUserId, targetUserId]);

  const loadMessages = async (currentOffset = offset) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await messageService.getMessagesBetweenUsers(currentUserId, targetUserId, 15, currentOffset);
      const messages = res.data.reverse(); // đảo ngược vì BE trả DESC
      if (messages.length < 10) setHasMore(false);
      addMessages(messages, true); // prepend
      setOffset(currentOffset + messages.length);
    } catch (err) {
      console.error("Lỗi tải messages:", err);
    } finally {
      setLoading(false);
    }
  };

  return { messages: filteredMessages, loading, loadMore: () => loadMessages(offset), hasMore };
}
