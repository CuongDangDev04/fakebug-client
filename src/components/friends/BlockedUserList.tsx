'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import BlockedUserSkeleton from '../skeleton/BlockedUserSkeleton';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';
import { toast } from 'sonner';
import { useFriendStore } from '@/stores/friendStore';
import { friendshipService } from '@/services/friendshipService';

export default function BlockedUserList() {
  const blockedUsers = useFriendStore(state => state.blockedUsers);
  const loading = useFriendStore(state => state.loading);
  const loadBlockedUsers = useFriendStore(state => state.loadBlockedUsers);
  const setBlockedUsers = useFriendStore(state => state.setBlockedUsers);
  const hasLoaded = useFriendStore(state => state.hasLoaded);

  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  // Load dữ liệu khi mount
  useEffect(() => {
    if (!hasLoaded) {
      loadBlockedUsers();
    }
  }, [loadBlockedUsers, hasLoaded]);

  const handleUnblock = async (userId: number) => {
    setUnblockingId(userId);
    try {
      await friendshipService.unblockUser(userId);

      // Cập nhật trong store: lọc bỏ user đã bỏ chặn
      setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Lỗi khi bỏ chặn:', error);
    } finally {
      setUnblockingId(null);
    }
  };

  const confirmUnblockUser = (userId: number, firstName: string, lastName: string) => {
    ConfirmDelete({
      title: 'Xác nhận bỏ chặn',
      description: `Bạn có chắc chắn muốn bỏ chặn ${firstName} ${lastName}?`,
      confirmText: 'Bỏ chặn',
      cancelText: 'Huỷ',
      onConfirm: async () => {
        await handleUnblock(userId);
        toast.success(`Đã huỷ chặn ${firstName} ${lastName}`);
      }
    });
  };

  if (loading) return (
    <div className="w-3/6 ">
      <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-[#e4e6eb]">
        Danh sách đã chặn
      </h2>
      {[...Array(3)].map((_, i) => (
        <BlockedUserSkeleton key={i} />
      ))}
    </div>
  );

  if (!blockedUsers.length) return (
    <div className="flex items-center justify-center min-h-[120px] text-gray-500 dark:text-[#b0b3b8]">
      Không có người dùng nào bị chặn.
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-900 dark:text-[#e4e6eb]">
        Danh sách đã chặn
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blockedUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || `https://i.pravatar.cc/100?img=${user.id}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-14 h-14 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  Đã bị chặn
                </p>
              </div>
            </div>
            <button
              onClick={() => confirmUnblockUser(user.id, user.firstName, user.lastName)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              disabled={unblockingId === user.id}
            >
              <X className="w-4 h-4" />
              <span>{unblockingId === user.id ? 'Đang bỏ chặn...' : 'Bỏ chặn'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
