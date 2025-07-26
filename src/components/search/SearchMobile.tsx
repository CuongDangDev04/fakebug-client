'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/services/userService'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function SearchMobile() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (!query.trim()) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const res = await userService.searchUsers(query, 1, 10)
                setResults(res.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [query])

    // Xử lý khi nhấn Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            router.push(`/ket-qua-tim-kiem?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-dark-bg text-black dark:text-white">
            {/* Header search */}
            <div className="sticky top-0 z-50 bg-white dark:bg-dark-bg px-4 py-3 flex items-center gap-3 border-b dark:border-dark-border">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="text-gray-700 dark:text-white" />
                </button>
                <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown} 
                    placeholder="Tìm kiếm người dùng..."
                    className="w-full bg-transparent outline-none text-base placeholder:text-gray-400"
                />
            </div>

            {/* Kết quả */}
            <div className="px-4">
                {loading && <p className="text-sm mt-3 text-gray-500">Đang tìm kiếm...</p>}

                {!loading && results.length === 0 && query && (
                    <p className="text-sm mt-3 text-gray-500">Không tìm thấy người dùng nào</p>
                )}

                {!loading &&
                    results.map((user) => (
                        <Link
                            href={`/trang-ca-nhan/${user.id}`}
                            key={user.id}
                            className="flex items-center gap-3 py-3 border-b dark:border-dark-border"
                        >
                            <Image
                                src={user.avatar_url || '/default-avatar.png'}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                                alt={user.id.toString()}
                            />
                            <div className="text-sm">
                                <p className="font-medium">{user.first_name} {user.last_name}</p>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    )
}
