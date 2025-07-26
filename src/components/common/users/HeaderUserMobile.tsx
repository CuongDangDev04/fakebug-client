'use client'

import { Menu, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'next/navigation'

type Props = {
  onMenuClick?: () => void
}

export default function HeaderUserMobile({ onMenuClick }: Props) {
  const { user } = useUserStore()
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 w-full h-[56px] flex items-center justify-between px-4 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border z-50">
      

      <Link href="/" className="flex items-center gap-1">
        <Image src="/lg.png" alt="Logo" width={32} height={32} />
      </Link>

      <div className="flex items-center gap-3">
        {/* Nút Search mới */}
        <button
          onClick={() => router.push('/tim-kiem-mobile')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover"
        >
          <Search size={26} strokeWidth={2} />
        </button>

        <Link href="/trang-ca-nhan">
          <Image
            src={user?.avatar_url || '/default-avatar.png'}
            width={32}
            height={32}
            className="rounded-full"
            alt="avatar"
          />
        </Link>
      </div>
    </header>
  )
}
