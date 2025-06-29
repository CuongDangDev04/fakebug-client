'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

// Giả lập dữ liệu bạn bè và lịch sử trò chuyện
const mockFriends = [
  { id: 2, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "Trần Thị B", avatar: "https://i.pravatar.cc/40?img=3" },
  { id: 4, name: "Lê Văn C", avatar: "https://i.pravatar.cc/40?img=4" },
];

const mockConversations = [
  { id: 2, name: "Nguyễn Văn A", lastMessage: "Chào bạn!", time: "09:30", avatar: "https://i.pravatar.cc/40?img=2", online: true },
  { id: 3, name: "Trần Thị B", lastMessage: "Bạn khỏe không?", time: "08:45", avatar: "https://i.pravatar.cc/40?img=3", online: false },
  { id: 4, name: "Lê Văn C", lastMessage: "Hẹn gặp lại.", time: "08:15", avatar: "https://i.pravatar.cc/40?img=4", online: true },
];

interface ChatSidebarProps {
  currentUserId: number;
}

export default function ChatSidebar({ currentUserId }: ChatSidebarProps) {
  const [friends, setFriends] = useState(mockFriends);
  const [conversations, setConversations] = useState(mockConversations);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // fetch friends/conversations nếu cần
  }, []);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card border-r">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-bold text-xl">Chat</span>
        {/* Có thể thêm icon hoặc nút tạo hội thoại mới ở đây */}
      </div>
      {/* Search box */}
      <div className="p-3 border-b bg-gray-50 dark:bg-dark-hover">
        <div className="flex items-center bg-gray-100 dark:bg-dark rounded-full px-3 py-2">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            className="bg-transparent outline-none flex-1 text-sm"
            placeholder="Tìm kiếm trên Chat của FakeBug"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && (
          <div className="text-center text-gray-400 mt-8">Không có hội thoại nào</div>
        )}
        {filteredConversations.map(conv => (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-dark-hover transition cursor-pointer group"
          >
            <div className="relative">
              <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover border" />
              {conv.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base truncate">{conv.name}</div>
              <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
            </div>
            <div className="text-xs text-gray-400 ml-2">{conv.time}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
