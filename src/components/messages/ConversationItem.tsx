import Link from "next/link";
import { useUserOnlineStatus } from "@/hooks/useUserOnlineStatus";
import { FriendsMessage } from "@/types/message";

interface ConversationItemProps {
  fm: FriendsMessage;
}

export default function ConversationItem({ fm }: ConversationItemProps) {
  const { isOnline } = useUserOnlineStatus(fm.friendId);
  return (
    <Link
      key={fm.id}
      href={`/tin-nhan/${fm.friendId}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-dark-hover transition cursor-pointer group"
    >
      <div className="relative">
        <img src={fm.avatar_url} alt={fm.friendName} className="w-12 h-12 rounded-full object-cover border" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-base truncate text-gray-900 dark:text-dark-text-primary">{fm.friendName}</div>
        <div className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">{fm.content}</div>
      </div>
      <div className="text-xs text-gray-400 dark:text-dark-text-secondary ml-2">{new Date(fm.sent_at).toLocaleString('vi-VN')}</div>
    </Link>
  );
}
