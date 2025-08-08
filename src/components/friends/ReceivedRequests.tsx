'use client';
import { useState, useEffect } from 'react';
import { friendshipService } from '@/services/friendshipService';
import Link from 'next/link';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import ReceivedRequestSkeleton from '../skeleton/ReceivedRequestSkeleton';
import { FriendRequest } from '@/types/friendship';

export default function ReceivedRequests() {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { respondToFriendRequest } = useFriendship();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const received = await friendshipService.getReceivedRequests();
      const requests = received?.data.requests || [];

      const requestsWithMutuals = await Promise.all(
        requests.map(async (req: any) => {
          try {
            const mutualResponse = await friendshipService.getMutualFriends(req.from.id);
            return { ...req, mutualFriends: mutualResponse?.data.total || 0 };
          } catch {
            return { ...req, mutualFriends: 0 };
          }
        })
      );

      setReceivedRequests(requestsWithMutuals);
    } catch (error) {
      console.error('Lỗi khi tải lời mời kết bạn:', error);
      setReceivedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: number, accept: boolean) => {
    const request: any = receivedRequests.find((r: any) => r.id === requestId);
    if (!request) {
      console.error("Không tìm thấy lời mời với ID:", requestId);
      return;
    }

    if (await respondToFriendRequest(requestId, accept, request.from)) {
      loadRequests();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen sm:min-h-[calc(100vh-220px)] p-4 sm:p-0">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
          Lời mời đã nhận
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <ReceivedRequestSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-220px)] p-4 sm:p-0">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
        Lời mời đã nhận ({receivedRequests.length})
      </h2>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
          {receivedRequests.map((request: any) => (
            <div
              key={request.id}
              className="flex items-center space-x-3 p-3 sm:p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"
            >
              <Link href={`/trang-ca-nhan/${request.from.id}`} className="shrink-0">
                <Image
                  src={request.from.avatar || '/default-avatar.png'}
                  alt={`${request.from.firstName} ${request.from.lastName}`}
                  width={90}
                  height={90}
                  className="w-16 h-16 sm:w-[90px] sm:h-[90px] rounded-full sm:rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/trang-ca-nhan/${request.from.id}`}
                  className="font-semibold text-sm sm:text-base hover:underline text-gray-900 dark:text-dark-text-primary truncate block"
                >
                  {request.from.firstName} {request.from.lastName}
                </Link>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-secondary mb-2">
                  {request.mutualFriends} bạn chung
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleRespond(request.id, true)}
                    className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span className="truncate">Xác nhận</span>
                  </button>
                  <button
                    onClick={() => handleRespond(request.id, false)}
                    className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="truncate">Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
