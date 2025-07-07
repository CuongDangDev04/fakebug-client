'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, UserPlus, Users, UserCheck, X, UserRoundX } from 'lucide-react';
import React from 'react';

export default function FriendWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const sidebarItems = [
        { path: 'tat-ca', label: 'Tất cả bạn bè', icon: Users },
        { path: 'loi-moi-ket-ban-da-nhan', label: 'Lời mời nhận được', icon: UserPlus },
        { path: 'loi-moi-ket-ban-da-gui', label: 'Lời mời đã gửi', icon: UserCheck },
        { path: 'goi-y', label: 'Gợi ý', icon: UserPlus },
        { path: 'danh-sach-chan', label: 'Danh sách bị chặn', icon: UserRoundX}
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-dark-bg">
            {/* Sidebar */}
            <div className="hidden md:block w-[360px] bg-white dark:bg-dark-card p-4 shadow-sm fixed top-[56px] bottom-0 overflow-y-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">Bạn bè</h1>
                <div className="space-y-1">
                    {sidebarItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            href={`/ban-be/${path}`}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors ${pathname === `/ban-be/${path}`
                                ? 'bg-blue-50 dark:bg-dark-hover text-blue-600 dark:text-dark-text-primary'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-hover dark:text-dark-text-primary'
                                }`}
                        >
                            <Icon className="w-6 h-6 mr-2" />
                            <span className="font-medium">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 md:p-8 md:ml-[360px]">
                <div className="max-w-5xl mx-auto">
                    {/* Mobile tabs */}
                    <div className="md:hidden flex overflow-x-auto mb-4 -mx-4 px-4">
                        {sidebarItems.map(({ path, label }) => (
                            <Link
                                key={path}
                                href={`/ban-be/${path}`}
                                className={`flex-shrink-0 px-4 py-2 mr-2 rounded-full ${pathname === `/ban-be/${path}` ? 'bg-blue-50 text-blue-600' : 'bg-gray-100'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Search bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm bạn bè"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-dark-hover dark:text-dark-text-primary dark:placeholder-dark-text-secondary rounded-full border-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
