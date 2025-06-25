'use client'
import React, { useRef, useState } from 'react';
import useChatMessages from '../../hooks/useChatMessages';


interface ChatBoxProps {
  currentUserId: number;
  targetUserId: number;
}

export default function ChatBox({ currentUserId, targetUserId }: ChatBoxProps) {
  const { messages, loading, setMessages, sendMessage } = useChatMessages(currentUserId, targetUserId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const handleSend = async () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Loại bỏ tin nhắn trùng id (nếu có)
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set();
    return messages.filter(msg => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-full border rounded shadow bg-white dark:bg-dark-card">
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
                <div className={`px-3 py-2 rounded-lg ${msg.sender.id === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-dark-hover'}`}>
                  {msg.content}
                </div>
                <div className="text-xs text-gray-500 mt-1 self-end">
                  {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
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
