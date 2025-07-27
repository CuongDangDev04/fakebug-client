'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'



export default function HeaderUserMobile() {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 w-full h-[56px] flex items-center justify-between px-4 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border z-50">


      <Link href="/" className="flex items-center gap-1">
        <Image src="/lg.png" alt="Logo" width={32} height={32} />
      </Link>

      <div className="flex dark:text-gray-100 items-center gap-3">
        <button
          onClick={() => router.push('/tim-kiem-mobile')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover"
        >
          <Search size={26} strokeWidth={2} />
        </button>


      </div>
    </header>
  )
}
