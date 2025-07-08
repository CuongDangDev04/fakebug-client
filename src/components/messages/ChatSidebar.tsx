import { useEffect, useState } from "react";
import ConversationItem from "./ConversationItem";
import { messageService } from "@/services/messageService";
import { useFriendMessagesStore } from "@/stores/friendMessagesStore";

export default function ChatSidebar({ mobileOpen = true, onClose }: { mobileOpen?: boolean, onClose?: () => void }) {
  const { friends, setFriends } = useFriendMessagesStore();
  const [search, setSearch] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch danh sách hội thoại và tổng số chưa đọc khi mount
  useEffect(() => {
    const fetchFriendsMessages = async () => {
      const res = await messageService.getFriendMessages();
      console.log("Friends in sidebar update:", res.friends);
      if (res?.friends) {
        setFriends(res.friends);
        setTotalUnread(res.totalUnreadCount ?? 0);
      } else {
        setFriends(res || []);
        setTotalUnread(0);
      }
    };
    fetchFriendsMessages();
  // Sửa dependencies thành [] để không thay đổi giữa các lần render
  }, []);

  // Realtime: cập nhật danh sách hội thoại và tổng số chưa đọc khi có newMessage hoặc message-read
  useEffect(() => {
    const socket = (window as any).chatSocket;
    if (!socket) return;

    const updateSidebar = async () => {
      const res = await messageService.getFriendMessages();
      if (res?.friends) {
        setFriends(res.friends);
        setTotalUnread(res.totalUnreadCount ?? 0);
      } else {
        setFriends(res || []);
        setTotalUnread(0);
      }
    };

    socket.on('newMessage', updateSidebar);
    socket.on('message-read', updateSidebar);
    socket.on('reactionUpdated', updateSidebar)
    return () => {
      socket.off('newMessage', updateSidebar);
      socket.off('reactionUpdated', updateSidebar)
      socket.off('message-read', updateSidebar);
    };
  // Sửa dependencies thành [] để không thay đổi giữa các lần render
  }, []);

  // Không cần tính lại unreadCount từ allMessages nữa, dùng từ backend trả về
  const filtered = friends.filter((f) =>
    f.friendName?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div
      className={`
        h-[90vh] flex flex-col bg-white dark:bg-dark-card border-r
        w-80 max-w-full
        fixed md:static top-0 left-0 z-40
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        md:w-80
        w-4/5 sm:w-3/5
        md:max-w-xs
        shadow-lg md:shadow-none
      `}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-bold text-xl text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
          Chat
          {totalUnread > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center" style={{ lineHeight: "18px" }}>
              {totalUnread}
            </span>
          )}
        </span>
        {/* Nút đóng trên mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-dark-hover"
          onClick={onClose}
          aria-label="Đóng"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
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

      {/* Danh sách hội thoại */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: '91vh' }} // 128px: trừ hao cho header + search + viền/padding (tăng thêm để chắc chắn không dư)
      >
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 dark:text-dark-text-secondary mt-8">Không có hội thoại nào</div>
        )}
        {filtered.map((fm) => (
          <ConversationItem key={fm.id || fm.friendId} fm={fm} />
        ))}
      </div>
    </div>
  );
}
