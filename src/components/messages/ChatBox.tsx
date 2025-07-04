'use client';

import { useChatMessages } from '@/hooks/useChatMessages';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { useChatStore } from '@/stores/chatStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import Loader from '@/components/common/users/Loader';
import { useFriendMessagesStore } from '@/stores/friendMessagesStore'; // ✅ Thêm dòng này

interface ChatBoxProps {
  currentUserId: number;
  targetUserId: number;
}

export default function ChatBox({ currentUserId, targetUserId }: ChatBoxProps) {
  const { messages, loading, loadMore } = useChatMessages(currentUserId, targetUserId);
  const { isOnline: isTargetOnline, lastSeen, formatLastSeen } = useUserOnlineStatus(targetUserId);
  const isSeen = useChatStore((state) => state.readStatus[targetUserId]);

  const updateFriendMessage = useFriendMessagesStore((state) => state.updateMessage); // ✅ Gọi store

  const [input, setInput] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showTime, setShowTime] = useState<{ [id: string]: boolean }>({});
  const { isDark } = useThemeStore();
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const markAsReadInSidebar = useFriendMessagesStore((state) => state.markAsRead);
  useEffect(() => {
    const hasUnread = messages.some(
      (msg) => msg.sender.id === targetUserId && !msg.is_read
    );

    if (hasUnread) {
      const socket = (window as any).chatSocket;
      socket?.emit('markAsRead', {
        fromUserId: targetUserId,
        toUserId: currentUserId,
      });

      // 👇 Cập nhật store để sidebar mất in đậm ngay
      markAsReadInSidebar(targetUserId);
    }
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 20;
      setShowScrollToBottom(!isAtBottom);

      if (container.scrollTop <= 20 && !loadingMore) {
        setLoadingMore(true);
        const prevScrollHeight = container.scrollHeight;
        const prevMsgLength = messages.length;
        await loadMore();

        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          if (messages.length > prevMsgLength) {
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }
          setLoadingMore(false);
        }, 0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 20;
    setShowScrollToBottom(!isAtBottom);
  }, [messages]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;

    const socket = (window as any).chatSocket;
    socket?.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: targetUserId,
      content,
    });

    setInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter((msg) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  const lastSentByMe = [...uniqueMessages].reverse().find((msg) => msg.sender.id === currentUserId);

  return (
    <div className="flex flex-col h-full border rounded bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border">
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-dark-hover border-gray-200 dark:border-dark-border">
        <span className={`w-2 h-2 rounded-full ${isTargetOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="font-medium text-gray-900 dark:text-dark-text-primary">
          {isTargetOnline ? 'Đang hoạt động' : lastSeen ? formatLastSeen(lastSeen) : 'Ngoại tuyến'}
        </span>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-4 relative">
        {loading && <div className="text-gray-700 dark:text-dark-text-primary">Đang tải...</div>}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader />
          </div>
        )}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed left-1/2 transform -translate-x-1/2 bottom-24 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
            style={{ width: 44, height: 44 }}
            aria-label="Cuộn xuống cuối"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M12 16c-.28 0-.53-.11-.71-.29l-6-6a1.003 1.003 0 011.42-1.42L12 13.59l5.29-5.3a1.003 1.003 0 111.42 1.42l-6 6c-.18.18-.43.29-.71.29z" fill="currentColor" />
            </svg>
          </button>
        )}
        {uniqueMessages.map((msg, idx) => {
          const isMe = msg.sender.id === currentUserId;
          const isLastSentByMe = msg.id === lastSentByMe?.id;
          const wasRead = msg.is_read;
          const sentAt = (msg as any).sent_at || msg.createdAt;

          return (
            <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''} max-w-[75%]`}>
                <img className="rounded-full w-8 h-8 object-cover" src={(msg.sender as any).avatar_url} alt="avatar" />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-fit`}>
                  <div
                    className={`px-4 py-2 break-words max-w-[320px] cursor-pointer ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-dark-hover text-gray-900 dark:text-dark-text-primary'
                      }`}
                    style={{
                      borderRadius: 20,
                      borderTopRightRadius: 20,
                      borderTopLeftRadius: 20,
                      borderBottomRightRadius: isMe ? 6 : 20,
                      borderBottomLeftRadius: isMe ? 20 : 6,
                    }}
                    onClick={() =>
                      setShowTime((prev) => ({
                        ...prev,
                        [msg.id]: !prev[msg.id],
                      }))
                    }
                  >
                    {msg.content}
                  </div>
                  {showTime[msg.id] && (
                    <div className="text-[11px] text-gray-500 dark:text-dark-text-secondary mt-0.5">
                      {sentAt && new Date(sentAt).toLocaleString()}
                    </div>
                  )}
                  {isMe && isLastSentByMe && wasRead && (
                    <div className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">Đã xem</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t flex gap-2 border-gray-200 dark:border-dark-border">
        <input
          className="flex-1 border rounded px-3 py-2 text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-card placeholder-gray-400 dark:placeholder-dark-text-secondary"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Nhập tin nhắn..."
        />
        <button
          className="bg-blue-500 text-white dark:text-dark-text-primary px-4 py-2 rounded"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
