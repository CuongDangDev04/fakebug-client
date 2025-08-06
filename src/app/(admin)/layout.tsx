'use client'

import AdminHeader from '@/components/common/admin/AdminHeader'
import AdminSidebar from '@/components/common/admin/AdminSidebar'
import AppInit from '@/components/common/users/AppInit'
import { useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen text-gray-800 dark:text-dark-text-primary">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <AppInit />
      <div className="flex flex-col flex-1 w-full">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-dark-bg">
          {children}
        </main>
      </div>
    </div>
  )
}
