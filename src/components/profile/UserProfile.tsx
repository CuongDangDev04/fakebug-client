'use client';
import { UserPlus, Mail, UserMinus, Clock, Check, X, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { ProfileResponse } from '@/types/profile';
import { ProfileService } from '@/services/profileService';
import type { FriendshipStatus } from '@/types/friendship';
import { friendshipService } from '@/services/friendshipService';
import Link from 'next/link';
import SkeletonProfile from '../skeleton/SkeletonProfile';
import { useUserStore } from '@/stores/userStore';
import UserFriendList from './UserFriendList';

type TabType = 'posts' | 'friends' | 'photos';

export default function UserProfile() {
  const params = useParams();
  const userId = params?.userId as string;
  const tokenUserId = useUserStore((state) => state.user?.id);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (String(tokenUserId) === userId) {
      router.push('/trang-ca-nhan');
      return;
    }
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ProfileService.getOtherUserProfile(userId);
        if (data) {
          setProfileData(data);
        } else {
          setError('Không thể tải thông tin profile');
        }
      } catch (err) {
        setError('Đã có lỗi xảy ra khi tải profile');
        console.error('Lỗi:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId, tokenUserId, router]);

  useEffect(() => {
    const fetchFriendshipStatus = async () => {
      try {
        const response = await friendshipService.checkFriendshipStatus(Number(userId));
        setFriendshipStatus(response.data);
      } catch (error) {
        console.error('Error fetching friendship status:', error);
      }
    };

    if (userId) {
      fetchFriendshipStatus();
    }
  }, [userId]);

  const handleFriendAction = async () => {
    if (!userId) return;

    try {
      switch (friendshipStatus?.status) {
        case 'not_friend':
          const response = await friendshipService.sendFriendRequest(Number(userId));
          if (response.data) {
            setFriendshipStatus({ status: 'pending', message: 'Đã gửi lời mời kết bạn' });
          }
          break;
        case 'friend':
          await friendshipService.unfriend(Number(userId));
          setFriendshipStatus({ status: 'not_friend', message: 'Chưa là bạn bè' });
          break;
        case 'pending':
          await friendshipService.cancelSentRequest(Number(userId));
          setFriendshipStatus({ status: 'not_friend', message: 'Chưa là bạn bè' });
          break;
        case 'waiting':
          await friendshipService.respondToRequest(friendshipStatus.friendshipId!, true);
          setFriendshipStatus({ status: 'friend', message: 'Đã là bạn bè' });
          break;
      }
    } catch (error) {
      console.error('Error handling friend action:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!userId) return;
    setIsBlocking(true);
    try {
      await friendshipService.blockUser(Number(userId));
      setIsBlocked(true);
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!userId) return;
    setIsBlocking(true);
    try {
      await friendshipService.unblockUser(Number(userId));
      setIsBlocked(false);
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setIsBlocking(false);
    }
  };

  const renderFriendshipButton = () => {
    if (!friendshipStatus) return null;

    const baseButtonClass = "flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-full font-medium transition-colors w-full sm:w-auto";
    const primaryButtonClass = `${baseButtonClass} bg-white hover:bg-gray-100 text-gray-900`;
    const secondaryButtonClass = `${baseButtonClass} bg-gray-100 hover:bg-gray-200 text-gray-900`;

    if (isBlocked) {
      return (
        <button
          onClick={handleUnblockUser}
          className={secondaryButtonClass}
          disabled={isBlocking}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">{isBlocking ? 'Đang mở chặn...' : 'Bỏ chặn'}</span>
        </button>
      );
    }

    switch (friendshipStatus.status) {
      case 'not_friend':
        return (
          <button onClick={handleFriendAction} className={primaryButtonClass}>
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Kết bạn</span>
          </button>
        );
      case 'friend':
        return (
          <button onClick={handleFriendAction} className={primaryButtonClass}>
            <UserMinus className="w-4 h-4" />
            <span className="hidden sm:inline">Hủy kết bạn</span>
          </button>
        );
      case 'pending':
        return (
          <button onClick={handleFriendAction} className={primaryButtonClass}>
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Hủy lời mời</span>
          </button>
        );
      case 'waiting':
        return (
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleFriendAction} className={primaryButtonClass}>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Chấp nhận</span>
            </button>
            <button
              onClick={() => {/* Handle reject */ }}
              className={secondaryButtonClass}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Từ chối</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return <UserFriendList userId={Number(userId)} />;
      case 'photos':
        return (
          <div className="bg-white dark:bg-dark-card rounded-xl p-4">
            <h2 className="text-base md:text-lg font-semibold mb-4 dark:text-[#e4e6eb]">Ảnh</h2>
            <div className="h-32 flex items-center justify-center text-sm md:text-base text-gray-500 dark:text-[#b0b3b8]">
              Chưa có ảnh nào
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white dark:bg-dark-card rounded-xl p-4">
            <h2 className="text-base md:text-lg font-semibold mb-4 dark:text-[#e4e6eb]">Bài viết</h2>
            <div className="h-32 flex items-center justify-center text-sm md:text-base text-gray-500 dark:text-[#b0b3b8]">
              Chưa có bài viết nào
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonProfile />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!profileData) return null;

  const { user, friends } = profileData;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="relative bg-gray-200 dark:bg-dark-card">
        {user.detail?.cover_url ? (
          <img
            src={user.detail.cover_url}
            alt="Cover"
            className="w-full h-40 md:h-72 object-cover"
          />
        ) : (
          <div className="w-full h-40 md:h-60 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            Chưa có ảnh bìa
          </div>
        )}

        {/* Upload Cover Button */}


      </div>

      {/* Profile Header */}
      <div className="relative px-4 py-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8">

          {/* Avatar */}
          <div className="relative shrink-0 -mt-16 md:-mt-20">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white dark:ring-dark-bg overflow-hidden bg-gray-200">
              <img
                src={user.avatar_url || "https://i.pravatar.cc/300"}
                alt="Avatar"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Basic Info + Actions */}
          <div className="flex-1 text-center md:text-left text-dark dark:text-white w-full">

            {/* Tên và nút */}
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 w-full">
              <h1 className="text-2xl md:text-4xl  font-bold">{`${user.first_name} ${user.last_name}`}</h1>


            </div>

            <div className='flex flex-row w-full items-center justify-between'>
              {/* Tổng số bạn bè */}
              <p className="text-base md:text-sm text-gray-600 dark:text-white/80">
                {friends.total} bạn bè
              </p>

              {/* Actions */}
              <div className="flex flex-row gap-2 justify-end flex-wrap">
                {renderFriendshipButton()}
                <Link href={`/tin-nhan/${user.id}`}>
                  <button className="flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-full font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white">
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Nhắn tin</span>
                  </button>
                </Link>
                {!isBlocked ? (
                  <button
                    onClick={handleBlockUser}
                    className="flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-full font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
                    disabled={isBlocking}
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">{isBlocking ? 'Đang chặn...' : 'Chặn'}</span>
                  </button>
                ) : null}
              </div>
            </div>


          </div>
        </div>
      </div>


      {/* Navigation */}
      <div className="bg-white dark:bg-dark-card shadow-sm overflow-x-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-4 md:px-8 py-3 md:py-4 font-medium transition-colors relative
                ${activeTab === 'posts'
                  ? 'text-blue-600 dark:text-[#4497f5]'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
                }`}
            >
              Bài viết
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-[#4497f5]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-4 md:px-8 py-3 md:py-4 font-medium transition-colors relative
                ${activeTab === 'friends'
                  ? 'text-blue-600 dark:text-[#4497f5]'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
                }`}
            >
              Bạn bè
              {activeTab === 'friends' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-[#4497f5]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 px-4 md:px-8 py-3 md:py-4 font-medium transition-colors relative
                ${activeTab === 'photos'
                  ? 'text-blue-600 dark:text-[#4497f5]'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
                }`}
            >
              Ảnh
              {activeTab === 'photos' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-[#4497f5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        {activeTab === 'posts' ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Friends list */}
            <div className="w-full lg:w-[40%]">
              <div className="bg-white dark:bg-dark-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e4e6eb]">
                    Bạn bè · {friends.total}
                  </h2>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-xs md:text-sm text-blue-600 hover:text-blue-700 dark:text-[#4497f5] dark:hover:text-[#5aa1f5] font-medium"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {friends.list.slice(0, 9).map((friend) => (
                    <Link
                      href={`/trang-ca-nhan/${friend.id}`}
                      key={friend.id}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={friend.avatar_url || `https://i.pravatar.cc/300?img=${friend.id}`}
                          alt={`${friend.first_name} ${friend.last_name}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <p className="mt-1 md:mt-2 text-xs md:text-sm font-medium truncate text-gray-900 dark:text-white">
                        {`${friend.first_name} ${friend.last_name}`}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="w-full lg:w-[60%]">
              {renderTabContent()}
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div >
  );
}
