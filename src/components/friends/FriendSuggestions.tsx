'use client';
import { useState, useEffect } from 'react';
import { friendshipService } from '@/services/friendshipService';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus } from 'lucide-react';
import Loader from '../common/users/Loader';
import { useFriendship } from '@/hooks/useFriendship';

export default function FriendSuggestions() {
  const { sendFriendRequest } = useFriendship();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await friendshipService.getFriendSuggestions();
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Lỗi khi tải gợi ý kết bạn:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetId: number) => {
    const suggestion: any = suggestions.find((s: any) => s.id === targetId);
    if (suggestion && await sendFriendRequest(targetId)) {
      loadSuggestions();
    }
  };

  if (loading) {
    return <div><Loader /></div>;
  }

  return (
    <div className="min-h-screen sm:min-h-[calc(100vh-220px)] p-4 sm:p-0">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-dark-text-primary">
        Những người bạn có thể biết ({suggestions.length})
      </h2>
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
          {suggestions.map((suggestion: any) => (
            <div
              key={suggestion.id}
              className="flex items-center space-x-3 p-3 sm:p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border"
            >
              <Link href={`/trang-ca-nhan/${suggestion.id}`} className="shrink-0">
                <Image
                  src={suggestion.avatar || '/default-avatar.png'}
                  alt={`${suggestion.firstName} ${suggestion.lastName}`}
                  width={90}
                  height={90}
                  className="w-16 h-16 sm:w-[90px] sm:h-[90px] rounded-full sm:rounded-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/trang-ca-nhan/${suggestion.id}`}
                  className="font-semibold text-sm sm:text-base hover:underline text-gray-900 dark:text-dark-text-primary truncate block"
                >
                  {suggestion.firstName} {suggestion.lastName}
                </Link>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-secondary mb-2">
                  {suggestion.mutualFriendsCount} bạn chung
                </p>

                <button
                  onClick={() => handleSendRequest(suggestion.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="truncate">Thêm bạn bè</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

