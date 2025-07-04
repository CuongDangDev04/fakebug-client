import Link from "next/link";
import { useUserOnlineStatus } from "@/hooks/useUserOnlineStatus";
import { FriendsMessage } from "@/types/message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface ConversationItemProps {
  fm: FriendsMessage;
}

export default function ConversationItem({ fm }: ConversationItemProps) {
  const { isOnline } = useUserOnlineStatus(fm.friendId);
  const isUnread = fm.is_read === false;

  // Xử lý thời gian
  const sentAtFormatted =
    fm.sent_at && !isNaN(new Date(fm.sent_at).getTime())
      ? dayjs(fm.sent_at).fromNow()
      : "Vừa xong";

  return (
    <Link
      key={fm.id}
      href={`/tin-nhan/${fm.friendId}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-dark-hover transition cursor-pointer group"
    >
      {/* Avatar + Trạng thái online */}
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

      {/* Thời gian gửi */}
      <div className="text-xs text-gray-400 dark:text-dark-text-secondary ml-2 whitespace-nowrap">
        {sentAtFormatted}
      </div>
    </Link>
  );
}
