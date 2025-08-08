'use client'

import {
  Home, Users, MessageCircleMore,
  Bell, User, Sun, Moon, LogOut,
  Plus,
  ShieldUser
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import NotificationList from '@/components/notifications/NotificationList'
import UserSearchBox from '@/components/search/UserSearchBox'
import { useHeaderNotifications } from '@/hooks/useHeaderNotifications'
import { authService } from '@/services/authService'
import Modal from '@/components/posts/ModalCreat'
import CreatePost from '@/components/posts/CreatePost'

const navItems = [
  { icon: <Home size={32} />, href: '/' },
  { icon: <Users size={32} />, href: '/ban-be/tat-ca' },
  { icon: <MessageCircleMore size={32} />, href: '/tin-nhan' },
]

export default function HeaderPC() {
  const { isDark, toggleTheme, init } = useThemeStore()
  const pathname = usePathname()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotiDropdown, setShowNotiDropdown] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, clearUser } = useUserStore()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

  // ✅ Lấy số thông báo chưa đọc từ store bằng selector — RẤT QUAN TRỌNG!
  const unreadNotificationCount = useNotificationStore(
    (state) => state.notifications.filter((n) => !n.isRead).length
  )

  const { totalUnreadMessages, markAllAsRead } = useHeaderNotifications()

  useEffect(() => {
    init()
  }, [init])

  const handleLogout = async () => {
    try {
      const response = await authService.logout()
      if (response.message === 'Logout successful') {
        clearUser()
        setShowDropdown(false)
        router.push('/dang-nhap')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="w-full h-[65px] px-6 flex items-center justify-between bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border fixed top-0 z-50">
      {/* Logo + Search */}
      <div className="flex items-center gap-6">
        <Image src="/lg.png" alt="Fakebug Logo" width={36} height={36} className="object-contain" />
        <UserSearchBox />
      </div>

      {/* Navigation */}
      <nav className="flex items-center ">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className="p-3 hover:bg-gray-100 mx-14 dark:hover:bg-dark-hover transition-all text-gray-700 dark:text-dark-text-primary"
            >
              <span
                className={`
          relative inline-block
          ${isActive ? 'text-blue-800 dark:text-blue-400 ' : ''}
        `}
              >
                {item.icon}

                {item.href === '/tin-nhan' && totalUnreadMessages > 0 && (
                  <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none z-10 border-2 border-white dark:border-dark-card">
                    {totalUnreadMessages}
                  </span>
                )}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* Right section: theme, notifications, avatar */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div
          onClick={() => setIsCreatePostOpen(true)}
          className="p-2.5 text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg cursor-pointer"
        >
          <Plus size={22} />
        </div>
        <div className="relative">
          <div
            ref={bellRef}
            onClick={(e) => {
              e.stopPropagation()
              setShowNotiDropdown(!showNotiDropdown)
            }}
            className="p-2.5 text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg cursor-pointer"
          >
            <Bell size={22} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none z-10 border-2 border-white dark:border-dark-card">
                {unreadNotificationCount}
              </span>
            )}
          </div>

          {showNotiDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border z-50 max-h-[500px] overflow-y-auto"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">Thông báo</h3>
                <div className="flex items-center gap-4">
                  <span onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-red-800 cursor-pointer">
                    Đánh dấu đã đọc
                  </span>
                  <Link href="/thong-bao" className="text-sm text-blue-600 hover:text-red-800">
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <NotificationList />
            </div>
          )}
        </div>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Image
              src={user?.avatar_url || '/default-avatar.png'}
              width={32}
              height={32}
              className="rounded-full object-cover"
              alt="Avatar"
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
              <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center gap-3">
                <Image
                  src={user?.avatar_url || '/default-avatar.png'}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                  alt="Avatar"
                />
                <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
              <div className="p-2 space-y-1">
                {/* Hiển thị link quản trị nếu là admin */}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-800 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                  >
                    <ShieldUser size={20} />
                    <span>Đi đến trang quản trị</span>
                  </Link>
                )}
                <Link
                  href="/trang-ca-nhan"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-800 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                >
                  <User size={20} />
                  <span>Trang cá nhân</span>
                </Link>



                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                >
                  <LogOut size={20} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {isCreatePostOpen && (
        <Modal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)}>
          <CreatePost onPostSuccess={() => setIsCreatePostOpen(false)} />
        </Modal>
      )}
    </header>
  )
}
