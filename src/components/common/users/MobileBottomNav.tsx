'use client'

import { Home, Users, Bell, MessageCircleMore, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHeaderNotifications } from '@/hooks/useHeaderNotifications'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { totalUnreadMessages, unreadNotificationCount } = useHeaderNotifications()

  // Kiểm tra xem có phải route /tin-nhan hoặc /tin-nhan/:id hay không
  const isInTinNhanRoute = pathname === '/tin-nhan' || pathname.startsWith('/tin-nhan/')

  // Nếu đang trong route tin-nhan hoặc con của nó thì ẩn BottomNav
  if (isInTinNhanRoute) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[56px] bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border flex justify-around items-center z-50">
      <Link href="/" className="flex flex-col items-center dark:text-gray-100 justify-center gap-0.5">
        <Home size={35} className={isActive('/') ? 'text-blue-600' : ''} />
      </Link>

      <Link href="/ban-be/tat-ca" className="flex flex-col dark:text-gray-100 items-center justify-center gap-0.5">
        <Users size={35} className={isActive('/ban-be/tat-ca') ? 'text-blue-600' : ''} />
      </Link>

      <Link href="/tin-nhan" className="relative flex flex-col dark:text-gray-100 items-center justify-center gap-0.5">
        <MessageCircleMore size={35} className={isActive('/tin-nhan') ? 'text-blue-600' : ''} />
        {totalUnreadMessages > 0 && (
          <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none border-2 border-white dark:border-dark-card">
            {totalUnreadMessages}
          </span>
        )}
      </Link>

      <Link href="/thong-bao" className="relative flex flex-col dark:text-gray-100 items-center justify-center gap-0.5">
        <Bell size={35} className={isActive('/thong-bao') ? 'text-blue-600' : ''} />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none border-2 border-white dark:border-dark-card">
            {unreadNotificationCount}
          </span>
        )}
      </Link>

      <Link href="/menu-mobile" className="relative flex flex-col dark:text-gray-100 items-center justify-center gap-0.5">
        <Menu size={35} className={isActive('/menu-mobile') ? 'text-blue-600' : ''} />
      </Link>
    </nav>
  )
}
