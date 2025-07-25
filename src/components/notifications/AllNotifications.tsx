'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import SkeletonNotification from '@/components/skeleton/SkeletonNotification';
import { useNotifications } from '@/hooks/useNotifications';

export default function AllNotifications() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    loading,
    hasMore,
    lastItemRef,
    handleMarkAsRead,
    handleDelete,
  } = useNotifications(10, filter); // ✅ Gọi custom hook với filter

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
            Thông báo
          </h1>
          <div className="mt-4 flex gap-4">
            {['all', 'unread'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-4 py-2 rounded-full ${
                  filter === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text-primary'
                }`}
              >
                {type === 'all' ? 'Tất cả' : 'Chưa đọc'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-dark-border">
          {loading && notifications.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonNotification key={i} />)
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition ${
                  !n.isRead ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={n.avt || '/default-avatar.png'}
                    alt="notification icon"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.png';
                    }}
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      handleMarkAsRead(n.id, n.url);
                    }}
                  >
                    <p className="text-sm text-gray-800 dark:text-dark-text-primary">
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && notifications.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Không có thông báo nào.
          </div>
        )}

        {loading && notifications.length > 0 && <SkeletonNotification />}

        {hasMore && notifications.length > 0 && <div ref={lastItemRef} className="h-2" />}
      </div>
    </div>
  );
}
