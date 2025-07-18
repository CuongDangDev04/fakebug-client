import { useUserOnlineStatus } from "@/hooks/useUserOnlineStatus";
import { FriendsMessage } from "@/types/message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { messageService } from "@/services/messageService";
import { useFriendMessagesStore } from "@/stores/friendMessagesStore";
import { useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface ConversationItemProps {
  fm: FriendsMessage;
  onClick?: () => void;
}

export default function ConversationItem({ fm, onClick }: ConversationItemProps) {
  const { isOnline } = useUserOnlineStatus(fm.friendId);
  const unreadCount = typeof fm.unreadCount === "number" ? fm.unreadCount : 0;
  const isUnread = unreadCount > 0;
  const sentAtFormatted =
    fm.sent_at && !isNaN(new Date(fm.sent_at).getTime())
      ? dayjs(fm.sent_at).fromNow()
      : "Vừa xong";

  const { setFriends } = useFriendMessagesStore();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    // Bỏ e.preventDefault() để Link có thể chuyển hướng
    if (isUnread && !loading) {
      setLoading(true);
      await messageService.markAsRead(fm.friendId);
      const res = await messageService.getFriendMessages();
      if (res?.friends) setFriends(res.friends);
      setLoading(false);
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-dark-hover transition cursor-pointer group
        ${isUnread ? "font-semibold bg-blue-50 dark:bg-dark-hover" : ""}`}
      style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? "none" : "auto" }}
    >
      {/* Avatar */}
      <div className="relative">
        {fm.avatar_url ? (
          <img
            src={fm.avatar_url}
            alt={fm.friendName}
            className="w-12 h-12 rounded-full object-cover border"
          />
        ) : (
          <div className="w-12 h-12 rounded-full object-cover border bg-gray-300 dark:bg-dark-border flex items-center justify-center text-sm text-white">
            {fm.friendName?.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full" />
        )}
      </div>

      {/* Tên + Nội dung */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-base truncate ${
            isUnread
              ? "font-semibold text-black dark:text-white"
              : "font-medium text-gray-900 dark:text-dark-text-primary"
          }`}
        >
          {fm.friendName}
        </div>
        <div
          className={`text-xs truncate ${
            isUnread
              ? "font-semibold text-black dark:text-white"
              : "text-gray-500 dark:text-dark-text-secondary"
          }`}
        >
          {fm.content}
        </div>
      </div>

      {/* Thời gian + badge */}
      <div className="flex flex-col items-end min-w-[48px] ml-2">
        <div className="text-xs text-gray-400 dark:text-dark-text-secondary whitespace-nowrap mb-1">
          {sentAtFormatted}
        </div>
        <span
          className={`bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center transition-all duration-200
            ${unreadCount > 0 ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}`}
          style={{ lineHeight: "18px" }}
        >
          {unreadCount > 0 ? unreadCount : ""}
        </span>
      </div>
    </div>
  );
}