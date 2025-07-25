'use client'

import { Menu, Search, Bell, User, Sun, Moon, Home, Users, UsersRound, LogOut, MessageCircleMore } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useUserStore } from '@/stores/userStore'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import NotificationList from '@/components/notifications/NotificationList'
import { notificationService } from '@/services/notificationService'
import { messageService } from '@/services/messageService'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
    { icon: <Home size={32} />, href: '/' },
    { icon: <Users size={32} />, href: '/ban-be/tat-ca' },
    { icon: <UsersRound size={32} />, href: '/groups' },
    { icon: <MessageCircleMore size={32} />, href: '/tin-nhan' },
]

type Props = {
    onMenuClick?: () => void
}

export default function HeaderUser({ onMenuClick }: Props) {
    const { isDark, toggleTheme, init } = useThemeStore()
    const pathname = usePathname()
    const router = useRouter()
    const [showDropdown, setShowDropdown] = useState(false)
    const { user, clearUser } = useUserStore()
    const [showNotiDropdown, setShowNotiDropdown] = useState(false)
    const [totalUnread, setTotalUnread] = useState(0);
    const bellRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { clearNotifications, notifications } = useNotificationStore()

    const handleNavigate = () => {
        setShowDropdown(false)
    }

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

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        let isMounted = true;
        const fetchTotalUnread = async () => {
            const res = await messageService.getTotalUnreadCount();
            if (isMounted) setTotalUnread(res?.totalUnreadCount ?? 0);
        };
        fetchTotalUnread();

        // Đảm bảo socket luôn tồn tại trước khi lắng nghe
        let socket: any;
        const waitForSocket = () => {
            socket = (window as any).chatSocket;
            if (!socket) {
                setTimeout(waitForSocket, 300);
                return;
            }

            const updateUnread = async () => {
                const res = await messageService.getTotalUnreadCount();
                if (isMounted) setTotalUnread(res?.totalUnreadCount ?? 0);
            };

            socket.on('newMessage', updateUnread);
            socket.on('message-read', updateUnread);

            // Cleanup
            return () => {
                socket.off('newMessage', updateUnread);
                socket.off('message-read', updateUnread);
            };
        };

        const cleanup = waitForSocket();

        return () => {
            isMounted = false;
            if (typeof cleanup === 'function') cleanup();
        };
    }, []);

  const handleMarkAllAsRead = async () => {
    try {
        await notificationService.markAllAsRead();
        clearNotifications(); // ✅ Xóa tất cả noti trong store
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
};

    const handleToggleNotification = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowNotiDropdown(!showNotiDropdown);
    };

    return (
        <header className="w-full h-[65px] px-4 md:px-6 flex items-center justify-between bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border fixed top-0 z-50">
            <div className="flex items-center gap-4 md:gap-6">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-gray-700 dark:text-dark-text-primary p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <Image
                        src="/lg.png"
                        alt="Fakebug Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                </div>
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-dark-hover rounded-full px-4 py-2">
                    <Search size={20} className="text-gray-500 dark:text-dark-text-secondary mr-2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trên Fakebug..."
                        className="bg-transparent outline-none text-sm w-60 placeholder:text-gray-500 dark:placeholder:text-dark-text-secondary dark:text-dark-text-primary"
                    />
                </div>
            </div>

            <nav className="fixed left-0 md:left-1/2 bottom-0 md:bottom-auto md:-translate-x-1/2 flex items-center justify-around md:justify-center gap-1 md:gap-16 w-full md:w-auto bg-white dark:bg-dark-card md:bg-transparent border-t md:border-none border-gray-200 dark:border-dark-border p-1 md:p-0">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`p-2.5 md:p-3.5 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-xl transition-all text-gray-700 dark:text-dark-text-primary ${pathname === item.href ? 'bg-gray-100 dark:bg-dark-hover' : ''} relative`}
                    >
                        <span className="relative inline-block">
                            {item.icon}
                            {/* Badge đè lên viền icon chat */}
                            {item.href === '/tin-nhan' && totalUnread > 0 && (
                                <span className="absolute -bottom-1 -right-1 translate-x-1/4 translate-y-1/4 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none z-10 shadow-md border-2 border-white dark:border-dark-card">
                                    {totalUnread}
                                </span>
                            )}
                        </span>
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                >
                    {isDark ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                <div className="relative">
                    <div
                        ref={bellRef}
                        onClick={handleToggleNotification}
                        className="p-2.5 text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg relative cursor-pointer"
                    >
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>
                    {showNotiDropdown && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border z-50 max-h-[500px] overflow-y-auto"
                        >
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary">Thông báo</h3>
                                <div className="flex items-center gap-4">
                                    <span
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm text-blue-600 hover:text-red-800 cursor-pointer"
                                    >
                                        Đánh dấu tất cả đã đọc
                                    </span>
                                    <a href="/thong-bao" className="text-sm text-blue-600 hover:text-red-800">Xem tất cả</a>
                                </div>
                            </div>
                            <NotificationList />
                        </div>
                    )}
                </div>
                <div className="relative">
                    <button
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Image
                            src={user?.avatar_url || "https://github.com/identicons/user.png"}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                            alt={user?.username || 'User avatar'}
                        />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border">
                            <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={user?.avatar_url || "https://github.com/identicons/user.png"}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover"
                                        alt={user?.username || 'User avatar'}
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                                            {user?.first_name} {user?.last_name}
                                        </p>

                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                <Link
                                    href="/trang-ca-nhan"
                                    className="flex items-center px-4 py-2 text-gray-800 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                                    onClick={handleNavigate}
                                >
                                    <User size={20} className="mr-3" />
                                    Trang cá nhân
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg"
                                >
                                    <LogOut size={20} className="mr-3" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
