'use client';

import { useChatMessages } from '@/hooks/useChatMessages';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/stores/chatStore';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { Moon, Sun } from 'lucide-react';

interface ChatBoxProps {
  currentUserId: number;
  targetUserId: number;
}

export default function ChatBox({ currentUserId, targetUserId }: ChatBoxProps) {
  const { messages, loading } = useChatMessages(currentUserId, targetUserId);
  const { isOnline: isTargetOnline, lastSeen, formatLastSeen } = useUserOnlineStatus(targetUserId);
  const isSeen = useChatStore((state) => state.readStatus[targetUserId]);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State để điều khiển hiển thị thời gian gửi cho từng tin nhắn
  const [showTime, setShowTime] = useState<{ [id: string]: boolean }>({});

  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    // Kiểm tra nếu có ít nhất 1 tin nhắn chưa đọc từ đối phương
    const hasUnread = messages.some(
      (msg) => msg.sender.id === targetUserId && !msg.is_read
    );

    if (hasUnread) {
      const socket = (window as any).chatSocket as any;
      if (socket) {
        socket.emit('markAsRead', {
          fromUserId: targetUserId,
          toUserId: currentUserId,
        });
      }
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, targetUserId, currentUserId]);

  // Gửi tin nhắn
  const handleSend = () => {
    const content = input.trim();
    if (!content) return;

    const socket = (window as any).chatSocket as any;
    if (socket) {
      socket.emit('sendMessage', {
        senderId: currentUserId,
        receiverId: targetUserId,
        content,
      });
    }

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

  // Tìm tin nhắn cuối cùng do mình gửi
  const lastSentByMe = [...uniqueMessages]
    .reverse()
    .find((msg) => msg.sender.id === currentUserId);

  return (
    <div className="flex flex-col h-full border rounded bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-dark-hover border-gray-200 dark:border-dark-border">
        <span className={`w-2 h-2 rounded-full ${isTargetOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="font-medium text-gray-900 dark:text-dark-text-primary">
          {isTargetOnline
            ? 'Đang hoạt động'
            : lastSeen
              ? formatLastSeen(lastSeen)
              : 'Ngoại tuyến'}
        </span>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading ? (
          <div className="text-gray-700 dark:text-dark-text-primary">Đang tải...</div>
        ) : (
          uniqueMessages.map((msg, idx) => {
            const isMe = msg.sender.id === currentUserId;
            const isLastSentByMe = msg.id === lastSentByMe?.id;
            const wasRead = msg.is_read;

            // Lấy thời gian gửi từ sent_at thay vì createdAt
            const sentAt = (msg as any).sent_at || msg.createdAt;

            return (
              <div
                key={msg.id || idx}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''} max-w-[75%]`}
                >
                  {/* Avatar */}
                  <img
                    className="rounded-full w-8 h-8 object-cover flex-shrink-0"
                    src={(msg.sender as any).avatar_url}
                    alt="avatar"
                  />
                  {/* Bubble + time + đã xem */}
                  <div
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-fit`}
                  >
                    <div
                      className={`px-4 py-2 break-words max-w-[320px] cursor-pointer ${
                        isMe
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-dark-hover text-gray-900 dark:text-dark-text-primary'
                      }`}
                      style={{
                        borderRadius: 20,
                        borderTopRightRadius: 20,
                        borderTopLeftRadius: 20,
                        borderBottomRightRadius: isMe ? 6 : 20,
                        borderBottomLeftRadius: isMe ? 20 : 6,
                        minWidth: 40,
                        display: 'inline-block',
                        wordBreak: 'break-word'
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
                        {sentAt &&
                          new Date(sentAt).toLocaleString()}
                      </div>
                    )}
                    {/* Hiển thị "Đã xem" nếu là tin nhắn cuối cùng do mình gửi và đã được đọc */}
                    {isMe && isLastSentByMe && wasRead && (
                      <div className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">Đã xem</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Input */}
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


