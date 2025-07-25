'use client';

import { X } from 'lucide-react';
import SkeletonNotification from '../skeleton/SkeletonNotification';
import { useNotifications } from '@/hooks/useNotifications'; // ✅ Import custom hook

export default function NotificationList() {
  const {
    notifications,
    loading,
    hasMore,
    lastItemRef,
    handleMarkAsRead,
    handleDelete,
  } = useNotifications(10); // ✅ Gọi hook với limit 10

  return (
    <ul className="divide-y divide-gray-200 dark:divide-dark-border">
      {notifications.map((n, index) => (
        <div
          key={n.id}
          ref={index === notifications.length - 1 ? lastItemRef : null}
          className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition ${
            !n.isRead ? 'bg-gray-100 dark:bg-gray-800' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-1 flex items-start gap-3 cursor-pointer"
              onClick={() => handleMarkAsRead(n.id, n.url)}
            >
              <img
                src={n.avt || '/default-avatar.png'}
                alt="notification icon"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-dark-text-primary">
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(n.id);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      ))}

      {notifications.length === 0 && !loading && (
        <li className="p-4 text-center text-gray-500 dark:text-gray-400">
          Không có thông báo nào.
        </li>
      )}

      {loading && <SkeletonNotification />}

      {/* Đặt ref để trigger load thêm */}
      <div ref={lastItemRef} className="h-4" />
    </ul>
  );
}
