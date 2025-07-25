'use client'
import type { NotificationToastData } from '@/types/notification';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export function showNotificationToast({
  message,
  url,
  avt,
  createdAt,
  navigate,
}: NotificationToastData & { navigate: (url: string) => void }) {
  toast.custom((t) => (
    <div
      className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-zinc-900 dark:text-white shadow-md w-[320px] max-w-full relative"
    >
      <img
        src={avt ?? '/default-avatar.png'}
        alt="Avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex flex-col flex-1 cursor-pointer" onClick={() => {
        if (url) navigate(url);
        toast.dismiss(t);
      }}>
        <p className="text-sm">{message}</p>
        {createdAt && (
          <p className="text-xs text-zinc-500 mt-1">{createdAt}</p>
        )}
      </div>

      {/* Nút X xoá */}
      <button
        onClick={() => toast.dismiss(t)}
        className="absolute top-2 right-2 text-zinc-500 hover:text-red-500 transition"
      >
        <X size={16} />
      </button>
    </div>
  ));
}
