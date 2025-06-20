'use client'
import { Camera } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ProfileResponse } from '@/types/profile'
import { ProfileService } from '@/services/profileService'
import SkeletonProfile from '../skeleton/SkeletonProfile';
import MyProfileFriends from './MyProfileFriends';
import Link from 'next/link';

type TabType = 'posts' | 'friends' | 'photos';

export default function MyProfile() {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ProfileService.getProfile();
                console.log('friends list' ,data)

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
  }, []);

  if (isLoading) {
    return (
      <div >
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return <MyProfileFriends   />;
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-b from-gray-50 to-gray-200 dark:from-dark-card dark:to-dark-bg">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-4 py-8 sm:px-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 md:ring-8 ring-white/30 overflow-hidden">
                <img
                  src={user.avatar_url || "https://i.pravatar.cc/300"}
                  alt="Avatar"
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Avatar button */}
              <button className="absolute bottom-0 right-0 p-2 md:p-3 bg-white/90 hover:bg-white dark:bg-dark-card dark:hover:bg-dark-hover text-gray-700 hover:text-gray-800 dark:text-dark-text-primary dark:hover:text-white rounded-full shadow-lg transition-colors">
                <Camera className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">{`${user.first_name} ${user.last_name}`}</h1>
              <p className="text-base md:text-lg text-white/80">{friends.total} bạn bè</p>

              {/* Actions */}
              <div className="mt-4 md:mt-6 flex flex-row gap-2 justify-center md:justify-start w-full">
                <button className="flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-full font-medium transition-colors bg-white/90 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 hover:text-gray-800  dark:text-dark-text-primary dark:hover:text-white w-full sm:w-auto">
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Thêm ảnh bìa</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-full font-medium transition-colors bg-white/90 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 hover:text-gray-800 dark:text-dark-text-primary dark:hover:text-white w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Chỉnh sửa trang cá nhân</span>
                </button>
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
                    <Link href={`/trang-ca-nhan/${friend.id}`} key={friend.id} className="group cursor-pointer">
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
    </div>
  )
}
