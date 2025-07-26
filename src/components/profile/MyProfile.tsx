'use client'

import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ProfileResponse } from '@/types/profile'
import { ProfileService } from '@/services/profileService'
import SkeletonProfile from '../skeleton/SkeletonProfile'
import MyProfileFriends from './MyProfileFriends'
import Link from 'next/link'
import MyPostOnProfile from '../posts/MyPostOnProfile'
import EditProfileForm from './EditProfileForm' // ✅ Thêm dòng này
import EditProfileModal from './EditProfileModal'

type TabType = 'posts' | 'friends' | 'photos'

export default function MyProfile() {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [uploading, setUploading] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ProfileService.getProfile()
      setProfileData(data || null)
    } catch {
      setError('Đã có lỗi xảy ra khi tải profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (!profileData) return
    setUploading(true)
    try {
      if (type === 'avatar') {
        await ProfileService.uploadAvatar(file, profileData.user.id)
      } else {
        await ProfileService.uploadCover(file, profileData.user.id)
      }
      await fetchProfile()
    } catch {
      console.error(`Upload ${type} thất bại`)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (isLoading) return <SkeletonProfile />
  if (error) return <div className="text-red-600">{error}</div>
  if (!profileData) return null

  const { user, friends } = profileData

  const renderTabContent = () => {
    switch (activeTab) {
      case 'friends':
        return <MyProfileFriends />
      case 'photos':
        return (
          <div className="bg-white dark:bg-dark-card rounded-xl p-4">
            <h2 className="font-semibold mb-4 dark:text-[#e4e6eb]">Ảnh</h2>
            <div className="h-32 flex items-center justify-center text-gray-500 dark:text-[#b0b3b8]">
              Chưa có ảnh nào
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-white dark:bg-dark-card rounded-xl">
            <MyPostOnProfile />
          </div>
        )
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Cover Image */}
      <div className="relative bg-gray-200 dark:bg-dark-card">
        {user.cover_url ? (
          <img
            src={user.cover_url}
            alt="Cover"
            className="w-full h-40 md:h-72 object-cover"
          />
        ) : (
          <div className="w-full h-40 md:h-60 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            Chưa có ảnh bìa
          </div>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file, 'cover')
          }}
        />
        <button
          onClick={() => coverInputRef.current?.click()}
          className="absolute flex flex-row justify-center items-center bottom-2 right-2 bg-white/80 dark:bg-gray-700 dark:text-white text-sm px-4 py-1 rounded-full hover:bg-white dark:hover:bg-dark-active"
        >
          <Camera className="w-4 h-4 mr-1" /> Thêm/Đổi ảnh bìa
        </button>
      </div>

      {/* Profile Header */}
      <div className="relative px-4 py-6 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8">
          <div className="relative shrink-0 -mt-16 md:-mt-20">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white dark:ring-dark-bg overflow-hidden bg-gray-200">
              <img
                src={user.avatar_url || 'https://i.pravatar.cc/300'}
                alt="Avatar"
                className="object-cover w-full h-full"
              />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, 'avatar')
              }}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white dark:bg-dark-card p-2 rounded-full shadow-md"
            >
              <Camera className="w-4 h-4 text-gray-700 dark:text-dark-text-primary" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {friends.total} bạn bè
            </p>
            {uploading && (
              <p className="mt-1 text-sm text-yellow-400">Đang tải ảnh...</p>
            )}

            {/* ✅ Edit Profile Form */}
            {user.bio && (
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line">
                {user.bio}
              </p>
            )}
          </div>
          <div className="right-0">
            <EditProfileModal
              initialData={{
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username || '',
                bio: user.bio || '',
              }}
              onUpdated={fetchProfile}
            />
          </div>
        </div>
        
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-card shadow-sm overflow-x-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto justify-around flex w-max md:w-full">
          {['posts', 'friends', 'photos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === tab
                ? 'text-blue-600 dark:text-[#4497f5]'
                : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
                }`}
            >
              {tab === 'posts' ? 'Bài viết' : tab === 'friends' ? 'Bạn bè' : 'Ảnh'}
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
                  <h2 className="font-semibold dark:text-[#e4e6eb]">
                    Bạn bè · {friends.total}
                  </h2>
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
                          src={
                            friend.avatar_url ||
                            `https://i.pravatar.cc/300?img=${friend.id}`
                          }
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
            <div className="w-full lg:flex-1">
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
