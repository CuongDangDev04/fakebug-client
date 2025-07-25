'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { userService } from '@/services/userService'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation' // 👉 Quan trọng: thêm lại

export default function UserSearchBox() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const router = useRouter()  

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (!query.trim()) {
                setResults([])
                setShowDropdown(false)
                return
            }

            setLoading(true)
            try {
                const res = await userService.searchUsers(query, 1, 10)
                setResults(res.data || [])
                setShowDropdown(true)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [query])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            setShowDropdown(false)
            router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`)  
        }
    }

    return (
        <div className="relative">
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-dark-hover rounded-full px-4 py-2 w-[300px]">
                <Search size={20} className="text-gray-500 dark:text-dark-text-secondary mr-2" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown} // 👉 Thêm lại để xử lý Enter
                    placeholder="Tìm kiếm người dùng..."
                    className="bg-transparent outline-none text-sm w-full placeholder:text-gray-500 dark:placeholder:text-dark-text-secondary dark:text-dark-text-primary"
                />
            </div>

            {showDropdown && results.length > 0 && (
                <div className="absolute top-12 w-full bg-white dark:bg-dark-card shadow-xl rounded-lg border border-gray-200 dark:border-dark-border z-50 max-h-80 overflow-y-auto">
                    {results.map((user) => (
                        <Link
                            href={`/trang-ca-nhan/${user.id}`}
                            key={user.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-hover"
                            onClick={() => {
                                setQuery('')
                                setShowDropdown(false)
                            }}
                        >
                            <Image
                                src={user.avatar_url || '/default-avatar.png'}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                                alt={user.id.toString()}
                            />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800 dark:text-dark-text-primary">
                                    {user.first_name} {user.last_name}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
