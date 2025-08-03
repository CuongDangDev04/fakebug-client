'use client'

import { Moon, Sun, Bell, Menu } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useUserStore } from '@/stores/userStore'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [darkMode, setDarkMode] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, clearUser } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
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
      router.push('/login') // hoặc đường dẫn login của bạn
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 shadow-sm">
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-md text-gray-600 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-primary-600 dark:text-dark-text-primary hidden md:block">
        Welcome, {user?.first_name || 'Admin'} 👋
      </h1>

      <div className="flex items-center gap-4 ml-auto relative" ref={dropdownRef}>
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover transition">
          <Bell className="w-5 h-5 text-gray-600 dark:text-dark-text-primary" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-active transition"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden"
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
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-md shadow-lg z-50">
              <button
                onClick={() => alert('View Profile')}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-hover"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-dark-hover"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
