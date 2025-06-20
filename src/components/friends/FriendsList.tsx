'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { friendshipService } from '@/services/friendshipService';
import type { FriendType } from '@/types/friendship';
import { MessageCircle, UserMinus } from 'lucide-react';
import FriendSkeletonCard from '../skeleton/FriendSkeletonCard';
import { useFriendship } from '@/hooks/useFriendship';

export default function FriendsList() {
  const { unfriend } = useFriendship();
  const [friends, setFriends] = useState<FriendType[]>([]);
  const [friendsWithMutual, setFriendsWithMutual] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friendshipService.getFriends();
      setFriends(response.data.friends);

      const friendsWithMutualData = await Promise.all(
        response.data.friends.map(async (friend: FriendType) => {
          const mutualResponse = await friendshipService.getMutualFriends(friend.id);
          return {
            ...friend,
            mutualFriendsCount: mutualResponse.data.total
          };
        })
      );

      setFriendsWithMutual(friendsWithMutualData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bạn bè:', error);
      setLoading(false);
    }
  };

  const handleUnfriend = async (targetId: number) => {
    if (await unfriend(targetId)) {
      loadFriends();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card">
      <div className="border-b border-gray-200 dark:border-dark-border px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Bạn bè</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary">{friendsWithMutual.length} người bạn</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-dark-border">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <FriendSkeletonCard key={index} />
          ))


        ) : (
          friendsWithMutual.map((friend: any) => (
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                  <div>
                    <Link
                      href={`/trang-ca-nhan/${friend.id}`}
                      className="font-semibold text-base sm:text-[17px] hover:underline text-gray-900 dark:text-dark-text-primary block"
                    >
                      {friend.firstName} {friend.lastName}
                    </Link>
                    <p className="text-gray-500 dark:text-dark-text-secondary text-xs sm:text-sm mt-0.5">
                      {friend.mutualFriendsCount} bạn chung
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#e7f3ff] dark:bg-dark-button-primary hover:bg-[#dbe7f2] dark:hover:bg-dark-button-hover text-blue-600 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Nhắn tin</span>
                    </button>
                    <button
                      onClick={() => handleUnfriend(friend.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span className="hidden sm:inline">Huỷ kết bạn</span>
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
