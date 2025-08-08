'use client'

import { Moon, Sun, Bell, Menu, LogOut, ArrowLeft } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useUserStore } from '@/stores/userStore'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useThemeStore } from '@/stores/themeStore' // import đúng path của bạn

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, clearUser } = useUserStore()
  const router = useRouter()

  // Lấy trạng thái dark mode và hàm toggle từ store
  const { isDark, toggleTheme, init } = useThemeStore()

  useEffect(() => {
    init() // khởi tạo dark mode class khi mount
  }, [init])

  useEffect(() => {
    // Đóng dropdown khi click ngoài
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
      clearUser()
      router.push('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const handleGoHome = () => {
    router.push('/')
    setDropdownOpen(false)
  }

  const toggleDarkMode = () => {
    toggleTheme()
    setDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 shadow-sm">
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-md text-gray-600 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4 ml-auto relative" ref={dropdownRef}>
        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden"
            aria-label="User menu"
          >
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              (user?.first_name?.[0] || 'A').toUpperCase()
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-md shadow-lg z-50 overflow-hidden">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover transition"
              >
                {isDark ? (
                  <>
                    <Sun size={16} />
                    <span>Chế độ sáng</span>
                  </>
                ) : (
                  <>
                    <Moon size={16} />
                    <span>Chế độ tối</span>
                  </>
                )}
              </button>

              {/* Quay lại trang chủ */}
              <button
                onClick={handleGoHome}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover transition"
              >
                <ArrowLeft size={16} />
                Quay lại trang chủ
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
