'use client'
import { useEffect, useState } from 'react';
import { friendshipService } from '@/services/friendshipService';
import { X } from 'lucide-react';

type BlockedUser = {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
};

export default function BlockedUserList() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await friendshipService.getBlockedUsers();
      setBlocked(res.data.blocked || []);
    } catch (e) {
      setBlocked([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleUnblock = async (userId: number) => {
    setUnblockingId(userId);
    try {
      await friendshipService.unblockUser(userId);
      setBlocked(blocked.filter(u => u.id !== userId));
    } finally {
      setUnblockingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[120px] text-gray-500 dark:text-[#b0b3b8]">
      Đang tải danh sách chặn...
    </div>
  );
  if (!blocked.length) return (
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
        {blocked.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || `https://i.pravatar.cc/100?img=${user.id}`}
                alt=""
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
              onClick={() => handleUnblock(user.id)}
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
