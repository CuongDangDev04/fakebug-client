'use client';
import { messageService } from "@/services/messageService";
import { FriendsMessage } from "@/types/message";
import { useEffect, useState } from "react";
import ConversationItem from "./ConversationItem";

export default function ChatSidebar() {
  const [friends, setFriends] = useState<FriendsMessage[]>([])  ;
  const [search, setSearch] = useState('');


  useEffect(() => {
    const fetchFriendsMessages = async () => {
      const res = await messageService.getFriendMessages()
      console.log('Friend messages:', res);
      setFriends(res);
    }
    fetchFriendsMessages()
  }, []);

  

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card border-r">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-bold text-xl">Chat</span>
      </div>
      {/* Search box */}
      <div className="p-3 border-b bg-gray-50 dark:bg-dark-hover">
        <div className="flex items-center bg-gray-100 dark:bg-dark rounded-full px-3 py-2">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
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
        {friends.length === 0 && (
          <div className="text-center text-gray-400 mt-8">Không có hội thoại nào</div>
        )}
        {friends.map(fm => (
          <ConversationItem key={fm.id} fm={fm} />
        ))}
      </div>
    </div>
  );
}
