'use client';

import { useChatMessages } from '@/hooks/useChatMessages';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/stores/chatStore';
import { useEffect, useRef, useState, useMemo } from 'react';

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
    <div className="flex flex-col h-full border rounded shadow bg-white dark:bg-dark-card">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-dark-hover">
        <span className={`w-2 h-2 rounded-full ${isTargetOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="font-medium">
          {isTargetOnline
            ? 'Đang hoạt động'
            : lastSeen
              ? formatLastSeen(lastSeen)
              : 'Ngoại tuyến'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          uniqueMessages.map((msg, idx) => {
            const isMe = msg.sender.id === currentUserId;
            const isLastSentByMe = msg.id === lastSentByMe?.id;
            const wasRead = msg.is_read;

            return (
              <div
                key={msg.id || idx}
                className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col items-end max-w-xs">
                  <div
                    className={`px-3 py-2 rounded-lg ${isMe
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-dark-hover'
                      }`}
                  >
                    {msg.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 self-end">
                    {msg.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </div>
                  {/* Hiển thị "Đã xem" nếu là tin nhắn cuối cùng do mình gửi và đã được đọc */}
                  {isMe && isLastSentByMe && wasRead && (
                    <div className="text-xs text-blue-500 mt-1">Đã xem</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Nhập tin nhắn..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
        
