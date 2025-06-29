'use client';

import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatStore } from '@/stores/chatStore';
import { messageService } from '@/services/messageService';
import { useEffect, useRef, useState, useMemo } from 'react';

interface ChatBoxProps {
  currentUserId: number;
  targetUserId: number;
}

export default function ChatBox({ currentUserId, targetUserId }: ChatBoxProps) {
  const { messages, loading } = useChatMessages(currentUserId, targetUserId);
  const onlineUserIds = useChatStore((state) => state.onlineUserIds);
  const userLastSeenMap = useChatStore((state) => state.userLastSeenMap);
  const setUserLastSeen = useChatStore((state) => state.setUserLastSeen);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTargetOnline = onlineUserIds.includes(targetUserId);
  const lastSeen = userLastSeenMap[targetUserId];

  // Cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gọi API lastSeen nếu offline và chưa có dữ liệu
  useEffect(() => {
    if (!isTargetOnline && !lastSeen) {
      messageService
        .getLastSeen(targetUserId)
        .then((data) => {
          if (data.lastSeen) {
            setUserLastSeen(targetUserId, data.lastSeen);
          }
        })
        .catch((err) => {
          console.error('Lỗi lấy lastSeen:', err);
        });
    }
  }, [isTargetOnline, lastSeen, targetUserId]);

  // Format thời gian offline
  const formatLastSeen = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins <= 0) return 'Online 1 phút trước';
    if (mins < 60) return `Online ${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Online ${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `Offline ${days} ngày trước`;
  };

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

  return (
    <div className="flex flex-col h-full border rounded shadow bg-white dark:bg-dark-card">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-dark-hover">
        <span
          className={`w-2 h-2 rounded-full ${isTargetOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        ></span>
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
          uniqueMessages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`mb-2 flex ${msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col items-end max-w-xs">
                <div
                  className={`px-3 py-2 rounded-lg ${
                    msg.sender.id === currentUserId
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
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
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
