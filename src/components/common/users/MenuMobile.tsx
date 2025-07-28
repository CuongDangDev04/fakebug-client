// app/menu/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { useThemeStore } from '@/stores/themeStore'
import Image from 'next/image'
import Link from 'next/link'
import { User, Sun, Moon, LogOut } from 'lucide-react'
import { authService } from '@/services/authService'

export default function MenuMobile() {
    const { user, clearUser } = useUserStore()
    const { isDark, toggleTheme } = useThemeStore()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            const response = await authService.logout()
            if (response.message === 'Logout successful') {
                clearUser()
                router.push('/dang-nhap')
            }
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <div className="min-h-  bg-gray-100 dark:bg-dark-bg p-4 space-y-4 md:hidden">
            {/* Header */}
            <div className="flex items-center  rounded-lg bg-white dark:bg-dark-card dark:border-dark-border p-4">
                <Image
                    src={user?.avatar_url || '/default-avatar.png'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    alt="Avatar"
                />
                <div className="font-semibold text-gray-900 dark:text-dark-text-primary">
                    {user?.first_name} {user?.last_name}
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
                <Link
                    href="/trang-ca-nhan"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white dark:bg-dark-card text-gray-800 dark:text-dark-text-primary"
                >
                    <User size={20} />
                    <span>Trang cá nhân</span>
                </Link>

                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-primary"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-white dark:bg-dark-card text-red-600"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    )
}
