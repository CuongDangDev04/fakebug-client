'use client'
import type { NotificationToastData } from '@/types/notification';
import { toast } from 'sonner';

export function showNotificationToast({
  message,
  url,
  avt,
  createdAt,
  navigate,
}: NotificationToastData & { navigate: (url: string) => void }) {
  toast.custom((t) => (
    <div
      onClick={() => {
        if (url) navigate(url);
        toast.dismiss(t);
      }}
      className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-zinc-900 dark:text-white shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors w-[320px] max-w-full"
    >
      <img
        src={avt ?? '/default-avatar.png'}
        alt="Avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <p className="text-sm">{message}</p>
        {createdAt && (
          <p className="text-xs text-zinc-500 mt-1">{createdAt}</p>
        )}
      </div>
    </div>
  ));
}

