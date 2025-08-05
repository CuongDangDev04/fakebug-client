'use client'

import Link from 'next/link'
import { Home, Users, Settings, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/admin' },
  { label: 'Quản lí người dùng', icon: Users, href: '/admin/quan-ly-nguoi-dung' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' }
]

export default function AdminSidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed md:static z-50 md:flex flex-col w-64 h-full bg-gradient-to-b from-white to-gray-50 dark:from-dark-card dark:to-dark-bg border-r border-gray-200 dark:border-dark-border shadow-sm transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-6 md:justify-center">
          <div className="text-xl font-bold text-primary-600 dark:text-dark-text-primary">
            Admin Panel
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text-primary'
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-100 dark:bg-dark-border text-primary-500 dark:text-primary-300'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="text-xs text-center text-gray-400 dark:text-dark-text-secondary py-4">
          &copy; 2025 Admin UI
        </div>
      </aside>
    </>
  )
}
