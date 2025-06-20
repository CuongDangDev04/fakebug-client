'use client'

import { BookMarked, UsersRound, CalendarClock, Settings, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const sidebarItems = [
  {
    icon: <Image src="https://github.com/identicons/user.png" width={32} height={32} className="w-8 h-8 rounded-full" alt="avatar" />,
    label: 'Tên người dùng',
    href: '/trang-ca-nhan'
  },
  { icon: <UsersRound size={24} />, label: 'Bạn bè', href: '/friends' },
  { icon: <BookMarked size={24} />, label: 'Đã lưu', href: '/saved' },
  { icon: <CalendarClock size={24} />, label: 'Kỷ niệm', href: '/memories' },
  { icon: <Settings size={24} />, label: 'Cài đặt', href: '/settings' },
]

type Props = {
  isMobileOpen?: boolean
  onClose?: () => void
}

export default function SidebarUser({ isMobileOpen, onClose }: Props) {
  const pathname = usePathname()

  // Đóng sidebar khi chuyển trang trên mobile
  useEffect(() => {
    if (isMobileOpen && onClose) {
      onClose()
    }
  }, [pathname])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[320px] h-[calc(100vh-65px)] pt-4 fixed left-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800">
        <nav className="flex flex-col space-y-1 px-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all ${pathname === item.href ? 'bg-gray-100 dark:bg-[#3A3B3C]' : ''
                }`}
            >
              <div className="text-gray-600 dark:text-[#E4E6EB]">{item.icon}</div>
              <span className="text-gray-900 dark:text-[#E4E6EB] text-[15px] font-medium">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-[100] transition-opacity duration-200 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      >
        <aside
          className={`w-[280px] h-full bg-white dark:bg-[#242526] transition-transform duration-200 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-[#3A3B3C]">
            <h2 className="font-semibold text-gray-900 dark:text-[#E4E6EB]">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-lg"
            >
              <X size={24} className="text-gray-600 dark:text-[#E4E6EB]" />
            </button>
          </div>
          <nav className="flex flex-col space-y-1 p-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-all ${pathname === item.href ? 'bg-gray-100 dark:bg-[#3A3B3C]' : ''
                  }`}
              >
                <div className="text-gray-600 dark:text-[#E4E6EB]">{item.icon}</div>
                <span className="text-gray-900 dark:text-[#E4E6EB] text-[15px] font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  )
}
