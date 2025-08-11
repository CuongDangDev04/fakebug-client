"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // thêm icon mũi tên
import ConversationItem from "./ConversationItem";
import { messageService } from "@/services/messageService";
import { useFriendMessagesStore } from "@/stores/friendMessagesStore";
import { useEffect, useState, useCallback } from "react";
import SidebarSkeleton from "../skeleton/SidebarSkeleton";
import { userService } from "@/services/userService";

export default function ChatSidebar({
  mobileOpen = true,
  onClose,
  onSelectUser,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
  onSelectUser?: (userId: number) => void;
}) {
  const { friends, setFriends, updateMessage, markAsRead } = useFriendMessagesStore();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchFriendsMessages = async () => {
    setIsLoading(true);
    const res = await messageService.getFriendMessages();
    setFriends(res?.friends || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFriendsMessages();
  }, []);

  useEffect(() => {
    const socket = (window as any).chatSocket;
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      updateMessage(msg);
    };

    const handleMessageRead = (data: { friendId: number }) => {
      markAsRead(data.friendId);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("message-read", handleMessageRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message-read", handleMessageRead);
    };
  }, [updateMessage, markAsRead]);

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

  const handleSearchChange = useCallback(async (value: string) => {
    setSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await userService.searchUsers(value.trim(), 1, 20);
      setSearchResults(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm user:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const listToShow = search.trim() ? searchResults : friends;
  const totalUnread = friends.reduce((sum, f) => sum + (f.unreadCount ?? 0), 0);

  return (
    <div
      className={`
        h-[calc(100vh-64px)] flex flex-col bg-white dark:bg-dark-card 
        w-full md:w-80 md:max-w-xs
        fixed md:static top-[64px] left-0 z-40
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        shadow-lg md:shadow-none
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-gray-600 dark:text-dark-text-secondary hover:text-blue-600">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-bold text-xl text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
            Đoạn chat
            {totalUnread > 0 && (
              <span
                className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
                style={{ lineHeight: "18px" }}
              >
                {totalUnread}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-gray-50 dark:bg-dark-card">
        <div className="flex items-center bg-gray-100 dark:bg-dark-bg rounded-full px-3 py-2">
          <svg
            className="w-4 h-4 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="bg-transparent outline-none flex-1 text-sm text-gray-900 dark:text-dark-text-gray placeholder-gray-700 dark:placeholder-dark-text-secondary"
            placeholder="Tìm kiếm trên Chat"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Danh sách chat */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '91vh' }}>
        {(isLoading || isSearching) ? (
          <SidebarSkeleton />
        ) : (
          <>
            {listToShow.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-dark-text-secondary mt-8">
                Không có hội thoại nào
              </div>
            ) : (
              listToShow.map((fm) => {
                if ('first_name' in fm) {
                  const friendId = fm.id;
                  const friendName = `${fm.first_name} ${fm.last_name}`.trim();
                  return (
                    <Link key={friendId} href={`/tin-nhan/${friendId}`} passHref>
                      <ConversationItem
                        fm={{
                          friendId,
                          friendName,
                          avatar_url: fm.avatar_url || '',
                          content: '',
                          sent_at: null,
                          unreadCount: 0,
                        } as any}
                        onClick={() => {
                          onSelectUser?.(friendId);
                          onClose?.();
                        }}
                        onDeleteConversation={() => handleDeleteConversation(friendId)}
                      />
                    </Link>
                  );
                }

                const friendId = fm.friendId ?? fm.id;
                return (
                  <Link key={friendId} href={`/tin-nhan/${friendId}`} passHref>
                    <ConversationItem
                      fm={fm}
                      onClick={() => {
                        onSelectUser?.(friendId);
                        onClose?.();
                      }}
                      onDeleteConversation={() => handleDeleteConversation(friendId)}
                    />
                  </Link>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
