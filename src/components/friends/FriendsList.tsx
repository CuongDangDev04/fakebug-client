'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircleMore, UserMinus } from 'lucide-react';
import FriendSkeletonCard from '../skeleton/FriendSkeletonCard';
import { useFriendship } from '@/hooks/useFriendship';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';
import { toast } from 'sonner';
import { useFriendStore } from '@/stores/friendStore';
import { useEffect } from 'react';
import { Friend } from '@/types/friendStoreType';

export default function FriendsList() {
  const { unfriend } = useFriendship();

  // Lấy dữ liệu và hàm từ zustand store
  const friends = useFriendStore(state => state.friends);
  const loading = useFriendStore(state => state.loading);
  const loadFriends = useFriendStore(state => state.loadFriends);
const hasLoaded = useFriendStore(state => state.hasLoaded);
  // Load bạn bè khi component mount
   useEffect(() => {
    if (!hasLoaded) {
      loadFriends();
    }
  }, [hasLoaded, loadFriends]);
  const confirmUnfriend = (friend: Friend) => {
    ConfirmDelete({
      title: 'Xác nhận huỷ kết bạn',
      description: `Bạn có chắc chắn muốn huỷ kết bạn với ${friend.firstName} ${friend.lastName}?`,
      confirmText: 'Huỷ kết bạn',
      cancelText: 'Huỷ',
      onConfirm: async () => {
        const success = await unfriend(friend.id);
        if (success) {
          await loadFriends();
          toast.success(`Huỷ kết bạn với ${friend.firstName} ${friend.lastName} thành công`);
        }
      }
    });
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card">
      <div className="border-b border-gray-200 dark:border-dark-border px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Bạn bè</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary">{friends.length} người bạn</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-dark-border">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <FriendSkeletonCard key={index} />
          ))
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
            >
              <Image
                src={friend.avatar || '/default-avatar.png'}
                alt={`${friend.firstName} ${friend.lastName}`}
                width={80}
                height={80}
                className="rounded-full object-cover w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]"
              />
              <div className="ml-3 sm:ml-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <div>
                    <Link
                      href={`/trang-ca-nhan/${friend.id}`}
                      className="font-semibold text-base sm:text-[17px] hover:underline text-gray-900 dark:text-dark-text-primary block"
                    >
                      {friend.firstName} {friend.lastName}
                    </Link>
                    <p className="text-gray-500 dark:text-dark-text-secondary text-xs sm:text-sm mt-0.5">
                      {friend.mutualFriendsCount ?? 0} bạn chung
                    </p>
                  </div>

                  <div className="flex mt-2 sm:mt-0">
                    <Link href={`/tin-nhan/${friend.id}`} className="w-1/2 sm:w-auto">
                      <button
                        className="w-full flex items-center justify-center bg-[#e4e6eb] dark:bg-dark-button-primary hover:bg-[#dbe7f2] dark:hover:bg-dark-button-hover text-gray-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                      >
                        <MessageCircleMore className="w-4 h-4" />
                        <span className="sm:inline">Nhắn tin</span>
                      </button>
                    </Link>

                    <button
                      onClick={() => confirmUnfriend(friend)}
                      className="w-1/2 sm:w-auto flex items-center justify-center bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span className="sm:inline">Huỷ kết bạn</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
