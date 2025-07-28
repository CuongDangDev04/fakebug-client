"use client";
import Link from "next/link";
import ConversationItem from "./ConversationItem";
import { messageService } from "@/services/messageService";
import { useFriendMessagesStore } from "@/stores/friendMessagesStore";
import { useEffect, useState } from "react";
import SidebarSkeleton from "../skeleton/SidebarSkeleton";

export default function ChatSidebar({
  mobileOpen = true,
  onClose,
  onSelectUser,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
  onSelectUser?: (userId: number) => void;
}) {
  const { friends, setFriends } = useFriendMessagesStore();
  const [search, setSearch] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriendsMessages = async () => {
    setIsLoading(true);
    const res = await messageService.getFriendMessages();
    setFriends(res?.friends || []);
    setTotalUnread(res?.totalUnreadCount ?? 0);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFriendsMessages();
  }, []);

  useEffect(() => {
    const socket = (window as any).chatSocket;
    if (!socket) return;

    const updateSidebar = async () => {
      await fetchFriendsMessages();
    };

    socket.on('newMessage', updateSidebar);
    socket.on('message-read', updateSidebar);
    socket.on('reactionUpdated', updateSidebar);

    return () => {
      socket.off('newMessage', updateSidebar);
      socket.off('message-read', updateSidebar);
      socket.off('reactionUpdated', updateSidebar);
    };
  }, []);

  const handleDeleteConversation = async (friendId: number) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xoá cuộc trò chuyện này?");
    if (!confirmDelete) return;

    try {
      await messageService.deleteConversation(friendId);
      await fetchFriendsMessages();
    } catch (error) {
      console.error("Lỗi khi xoá cuộc trò chuyện:", error);
    }
  };

  const filtered = friends.filter((f) =>
    f.friendName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`
        h-[90vh] flex flex-col bg-white dark:bg-dark-card 
        w-full md:w-80 md:max-w-xs
        fixed md:static top-0 left-0 z-40
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        shadow-lg md:shadow-none
      `}
    >
      <div className="flex items-center justify-between p-4 ">
        <span className="font-bold text-xl text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
          Đoạn chat
          {totalUnread > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center" style={{ lineHeight: "18px" }}>
              {totalUnread}
            </span>
          )}
        </span>
      </div>

      <div className="p-3  bg-gray-50 dark:bg-dark-card">
        <div className="flex items-center bg-gray-100 dark:bg-dark-bg rounded-full px-3 py-2">
          <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            className="bg-transparent outline-none flex-1 text-sm text-gray-900 dark:text-dark-text-gray placeholder-gray-700 dark:placeholder-dark-text-secondary"
            placeholder="Tìm kiếm trên Chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '91vh' }}>
        {isLoading ? (
          <SidebarSkeleton />
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-dark-text-secondary mt-8">
                Không có hội thoại nào
              </div>
            ) : (
              filtered.map((fm) => (
                <Link key={fm.id || fm.friendId} href={`/tin-nhan/${fm.friendId}`} passHref>
                  <ConversationItem
                    fm={fm}
                    onClick={() => {
                      onSelectUser?.(fm.friendId);
                      onClose?.();
                    }}
                    onDeleteConversation={() => handleDeleteConversation(fm.friendId)}
                  />
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
