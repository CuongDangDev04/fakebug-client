import { useEffect, useState } from "react";
import ConversationItem from "./ConversationItem";
import { messageService } from "@/services/messageService";
import { useFriendMessagesStore } from "@/stores/friendMessagesStore";

export default function ChatSidebar() {
  const { friends, setFriends } = useFriendMessagesStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFriendsMessages = async () => {
      const res = await messageService.getFriendMessages();
      setFriends(res);
    };
    fetchFriendsMessages();
  }, [setFriends]);

  const filtered = friends.filter((f) =>
    f.friendName?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card border-r">
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-bold text-xl text-gray-900 dark:text-dark-text-primary">Chat</span>
      </div>

      <div className="p-3 border-b bg-gray-50 dark:bg-dark-hover">
        <div className="flex items-center bg-gray-100 dark:bg-dark rounded-full px-3 py-2">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            className="bg-transparent outline-none flex-1 text-sm text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-secondary"
            placeholder="Tìm kiếm trên Chat của FakeBug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 dark:text-dark-text-secondary mt-8">Không có hội thoại nào</div>
        )}
        {filtered.map((fm) => (
          <ConversationItem key={fm.friendId} fm={fm} />
        ))}
      </div>
    </div>
  );
}
