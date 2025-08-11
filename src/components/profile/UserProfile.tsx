'use client';

import {
  UserPlus, Mail, UserMinus, Clock, Check, X, MoreHorizontal, Flag
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProfileService } from '@/services/profileService';
import { friendshipService } from '@/services/friendshipService';
import { userReportService } from '@/services/userReportService';
import { useUserStore } from '@/stores/userStore';
import SkeletonProfile from '../skeleton/SkeletonProfile';
import UserFriendList from './UserFriendList';
import OtherUserPosts from '../posts/OtherUserPosts';
import Link from 'next/link';
import type { ProfileResponse } from '@/types/profile';
import type { FriendshipStatus } from '@/types/friendship';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';

type TabType = 'posts' | 'friends' | 'photos';

export default function UserProfile() {
  const params = useParams();
  const userId = params?.userId as string;
  const tokenUserId = useUserStore((state) => state.user?.id);
  const currentUser = useUserStore((state) => state?.user)
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile
  useEffect(() => {

    if (String(tokenUserId) === userId) {
      router.push('/trang-ca-nhan');
      return;
    }
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await ProfileService.getOtherUserProfile(userId);
        if (!data) {
          router.push('/not-found');
          return;
        }
        if (data) setProfileData(data);
        else setError('Không thể tải thông tin profile');
      } catch (err) {
        setError('Đã có lỗi xảy ra khi tải profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId, tokenUserId, router]);

  // Fetch friendship status
  useEffect(() => {
    const fetchFriendshipStatus = async () => {
      try {
        const response = await friendshipService.checkFriendshipStatus(Number(userId));
        if (response) setFriendshipStatus(response.data);
      } catch (error) {
        console.error('Error fetching friendship status:', error);
      }
    };
    if (userId) fetchFriendshipStatus();
  }, [userId]);

  // Friend actions
  const handleFriendAction = async () => {
    if (!userId) return;
    try {
      switch (friendshipStatus?.status) {
        case 'not_friend':
          await friendshipService.sendFriendRequest(Number(userId));
            await notificationService.sendNotification(
                Number(userId),
                `Đã nhận lời mời kết bạn từ ${currentUser?.first_name} ${currentUser?.last_name}`,
                "/ban-be/loi-moi-ket-ban-da-nhan",
                currentUser?.avatar_url || '/default_avatar'
            );
          setFriendshipStatus({ status: 'pending', message: 'Đã gửi lời mời kết bạn' });
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
    } catch (err) {
      console.error(err);
    }
  };

  // Block user
  const handleBlockUser = async () => {
    setIsBlocking(true);
    toast.info("Đang chặn người dùng...");
    try {
      await friendshipService.blockUser(Number(userId));
      setIsBlocked(true);
      toast.success("Đã chặn người dùng!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi chặn người dùng!");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async () => {
    setIsBlocking(true);
    toast.info("Đang bỏ chặn người dùng...");
    try {
      await friendshipService.unblockUser(Number(userId));
      setIsBlocked(false);
      toast.success("Đã bỏ chặn người dùng!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi bỏ chặn!");
    } finally {
      setIsBlocking(false);
    }
  };
  const handleUnfriendWithConfirm = () => {
    ConfirmDelete({
      title: 'Xác nhận huỷ kết bạn?',
      description: 'Bạn có chắc chắn muốn huỷ kết bạn với người này?',
      confirmText: 'Huỷ kết bạn',
      cancelText: 'Đóng',
      onConfirm: async () => {
        if (!userId) return;
        try {
          await friendshipService.unfriend(Number(userId));
          setFriendshipStatus({ status: 'not_friend', message: 'Chưa là bạn bè' });
          toast.success('Đã huỷ kết bạn thành công');
        } catch (err) {
          toast.error('Lỗi khi huỷ kết bạn');
          console.error(err);
          throw err; // Để toast error của ConfirmDelete hiện lên
        }
      }
    });
  };
  // Report user
  const handleReportUser = async () => {
    try {
      await userReportService.reportUser(
        Number(userId),
        tokenUserId!,
        "Người này vi phạm nội quy"
      );
      await notificationService.sendNotification(
        Number(tokenUserId),
        `Đã gửi thành công báo cáo người dùng ${user.first_name} ${user.last_name}`,
        ``,
        '/lg.png'
      );
    } catch (error) {
      toast.error("Có lỗi xảy ra khi báo cáo!");
    }
    setShowDropdown(false);
  };


  // Friend button render
  const renderFriendshipButton = () => {
    if (!friendshipStatus) return null;

    const base =
      'inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full font-medium transition-colors text-sm';
    const primary = `${base} bg-white hover:bg-gray-100 text-gray-900`;
    const danger = `${base} bg-red-600 hover:bg-red-700 text-white`;

    if (isBlocked) {
      return (
        <button onClick={handleUnblockUser} className={primary} disabled={isBlocking}>
          <X className="w-4 h-4" />
          <span>Bỏ chặn</span>
        </button>
      );
    }

    switch (friendshipStatus.status) {
      case 'not_friend':
        return (
          <button onClick={handleFriendAction} className={primary}>
            <UserPlus className="w-4 h-4" />
            <span>Kết bạn</span>
          </button>
        );
      case 'friend':
        return (
          <button onClick={handleUnfriendWithConfirm} className={danger}>
            <UserMinus className="w-4 h-4" />
            <span>Hủy kết bạn</span>
          </button>
        );
      case 'pending':
        return (
          <button onClick={handleFriendAction} className={primary}>
            <Clock className="w-4 h-4" />
            <span>Hủy lời mời</span>
          </button>
        );
      case 'waiting':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={handleFriendAction} className={primary}>
              <Check className="w-4 h-4" />
              <span>Chấp nhận</span>
            </button>
            <button className={primary}>
              <X className="w-4 h-4" />
              <span>Từ chối</span>
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
            <h2 className="font-semibold mb-4 dark:text-[#e4e6eb]">Ảnh</h2>
            <div className="h-32 flex items-center justify-center text-gray-500 dark:text-[#b0b3b8]">
              Chưa có ảnh nào
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white dark:bg-dark-card rounded-xl">
            <OtherUserPosts />
          </div>
        );
    }
  };

  if (isLoading) return <SkeletonProfile />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!profileData) return null;

  const { user, friends } = profileData;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cover */}
      <div className="relative bg-gray-200 dark:bg-dark-card">
        {user.cover_url ? (
          <img src={user.cover_url} alt="Cover" className="w-full h-40 md:h-72 object-cover" />
        ) : (
          <div className="w-full h-40 md:h-60 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            Chưa có ảnh bìa
          </div>
        )}
      </div>

      {/* Header */}
      <div className="relative px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8">
          <div className="relative shrink-0 -mt-16 md:-mt-20">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white dark:ring-dark-bg overflow-hidden bg-gray-200">
              <img src={user.avatar_url || '/default_avatar.png'} alt="Avatar" className="object-cover w-full h-full" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{friends.total} bạn bè</p>
            {user.bio && (
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line">
                {user.bio}
              </p>
            )}
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 items-center relative">
              {renderFriendshipButton()}
              <Link href={`/tin-nhan/${user.id}`}>
                <button className="flex items-center gap-2 px-3 md:px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Nhắn tin</span>
                </button>
              </Link>

              {/* More Options */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg z-10 py-1">
                    <button
                      onClick={handleReportUser}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                      <Flag className="w-4 h-4 text-red-500" />
                      Báo cáo người dùng
                    </button>
                    <button
                      onClick={handleBlockUser}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200"
                      disabled={isBlocking}
                    >
                      <X className="w-4 h-4 text-red-500" />
                      {isBlocking ? 'Đang chặn...' : 'Chặn người dùng'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-card shadow-sm overflow-x-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto flex w-max md:w-full justify-around">
          {['posts', 'friends'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === tab
                ? 'text-blue-600 dark:text-[#4497f5]'
                : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
                }`}
            >
              {tab === 'posts' ? 'Bài viết' : tab === 'friends' ? 'Bạn bè' : ''}
              {activeTab === tab && (
                <div className="h-[3px] bg-blue-600 dark:bg-[#4497f5] mt-1 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="w-full mx-auto sm:px-24">
        {activeTab === 'posts' ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Friends List */}
            <div className="w-full lg:max-w-md">
              <div className="bg-white dark:bg-dark-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold dark:text-[#e4e6eb]">Bạn bè · {friends.total}</h2>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-sm text-blue-600 dark:text-[#4497f5]"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {friends.list.slice(0, 9).map((friend) => (
                    <Link
                      href={`/trang-ca-nhan/${friend.id}`}
                      key={friend.id}
                      className="group"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={friend.avatar_url || `https://i.pravatar.cc/300?img=${friend.id}`}
                          alt={`${friend.first_name} ${friend.last_name}`}
                          className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-900 dark:text-white truncate text-center">
                        {friend.first_name} {friend.last_name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="w-full lg:flex-1">{renderTabContent()}</div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}
