'use client';
import { useState, useEffect } from 'react';
import { friendshipService } from '@/services/friendshipService';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';

export default function SentRequests() {
  const { cancelFriendRequest } = useFriendship();
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const sent = await friendshipService.getSentRequests();
      setSentRequests(sent?.data.requests);
    } catch (error) {
      console.error('Lỗi khi tải lời mời kết bạn:', error);
    }
  };

  const handleCancelRequest = async (targetId: number) => {
    if (await cancelFriendRequest(targetId)) {
      loadRequests();
    }
  };

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-220px)] p-4 sm:p-0">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
        Lời mời đã gửi ({sentRequests.length})
      </h2>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
          {sentRequests.map((request: any) => (
            <div
              key={request.id}
              className="flex items-center space-x-3 p-3 sm:p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"
            >
              <Link href={`/trang-ca-nhan/${request.to.id}`} className="shrink-0">
                <Image
                  src={request.to.avatar || '/default-avatar.png'}
                  alt={`${request.to.firstName} ${request.to.lastName}`}
                  width={90}
                  height={90}
                  className="w-16 h-16 sm:w-[90px] sm:h-[90px] rounded-full sm:rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/trang-ca-nhan/${request.to.id}`}
                  className="font-semibold text-sm sm:text-base hover:underline text-gray-900 dark:text-dark-text-primary truncate block"
                >
                  {request.to.firstName} {request.to.lastName}
                </Link>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-secondary mb-2">
                  Đã gửi lời mời
                </p>

                <button
                  onClick={() => handleCancelRequest(request.to.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="truncate">Hủy yêu cầu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
