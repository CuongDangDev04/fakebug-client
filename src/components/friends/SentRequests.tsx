'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import SentRequestSkeleton from '../skeleton/SentRequestSkeleton';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';
import { toast } from 'sonner';
import { useFriendStore } from '@/stores/friendStore';

export default function SentRequests() {
  const sentRequests = useFriendStore(state => state.sentRequests);
  const loading = useFriendStore(state => state.loading);
  const loadSentRequests = useFriendStore(state => state.loadSentRequests);
  const hasLoaded = useFriendStore(state => state.hasLoadedSentRequests);

  const { cancelFriendRequest } = useFriendship();

  useEffect(() => {
     if (!hasLoaded) {
    loadSentRequests();
     }
  }, [loadSentRequests,hasLoaded]);

  const confirmCancelRequest = (request: any) => {
    ConfirmDelete({
      title: 'Xác nhận hủy lời mời kết bạn',
      description: `Bạn có chắc chắn muốn hủy lời mời kết bạn với ${request.to.firstName} ${request.to.lastName}?`,
      confirmText: 'Hủy yêu cầu',
      cancelText: 'Huỷ',
      onConfirm: async () => {
        const success = await cancelFriendRequest(request.to.id);
        if (success) {
          await loadSentRequests();
          toast.success(`Huỷ lời mời kết bạn thành công`);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen sm:min-h-[calc(100vh-220px)] p-4 sm:p-0">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
          Lời mời đã gửi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <SentRequestSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[120px] text-gray-500 dark:text-[#b0b3b8]">
        Không có lời mời đã gửi.
      </div>
    );
  }

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
                  onClick={() => confirmCancelRequest(request)}
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
