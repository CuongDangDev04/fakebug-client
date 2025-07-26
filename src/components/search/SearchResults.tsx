'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';
import { friendshipService } from '@/services/friendshipService';
import { useFriendship } from '@/hooks/useFriendship';
import { UserPlus, UserMinus, Clock, UserRound, ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { FriendshipStatuss } from '@/types/friendship';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
}


export default function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const [results, setResults] = useState<User[]>([]);
    const [friendshipMap, setFriendshipMap] = useState<Record<number, { status: FriendshipStatuss; mutualCount: number }>>({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const currentUser = useUserStore(state => state.user);
    const router = useRouter()

    const { sendFriendRequest, cancelFriendRequest, unfriend } = useFriendship();

    const fetchStatuses = async (users: User[]) => {
        try {
            const ids = users.map((u) => u.id);
            const res = await friendshipService.getFriendshipStatusBatch(ids);
            if (res?.data) {
                const map: Record<number, { status: FriendshipStatuss; mutualCount: number }> = {};
                res.data.forEach((item: any) => {
                    const status = item.status || item.friendshipStatus || item.friendship_status || 'NOT_FRIEND';
                    map[item.id] = {
                        status,
                        mutualCount: item.mutualCount ?? 0,
                    };
                });
                setFriendshipMap(map);
            }
        } catch (error) {
            console.error('Lỗi khi lấy trạng thái bạn bè:', error);
        }
    };

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await userService.searchUsers(q, page, 3);
            const users = res.data || [];
            setResults(users);
            setTotalPages(res.pagination.totalPages);
            await fetchStatuses(users);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [q, page]);

    const handleSendRequest = async (userId: number) => {
        const success = await sendFriendRequest(userId);
        if (success) await refresh();
    };

    const handleCancelRequest = async (userId: number) => {
        const success = await cancelFriendRequest(userId);
        if (success) await refresh();
    };

    const handleUnfriend = async (userId: number) => {
        const success = await unfriend(userId);
        if (success) await refresh();
    };

    const renderActionButton = (user: User) => {
        const data = friendshipMap[user.id];
        if (!data) return null;
        if (currentUser?.id === user.id) {
            return <div className="" />; // hoặc return null nếu bạn không cần giữ layout
        }
        const { status } = data;

        switch (status) {
            case 'FRIEND':
                return (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleUnfriend(user.id);
                        }}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                        <UserMinus className="w-4 h-4" />
                        <span>Hủy kết bạn</span>
                    </button>
                );

            case 'PENDING_SENT':
                return (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleCancelRequest(user.id);
                        }}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                        <Clock className="w-4 h-4" />
                        <span>Hủy lời mời</span>
                    </button>
                );

            case 'PENDING_RECEIVED':
                return (
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Đã nhận lời mời</span>
                    </div>
                );

            case 'NOT_FRIEND':
            default:
                return (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleSendRequest(user.id);
                        }}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Thêm bạn bè</span>
                    </button>
                );
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
             <button onClick={() => router.back()}>
                    <ArrowLeft className="text-gray-700 dark:text-white" />
                </button>
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">
                Kết quả cho: <span className="text-blue-600 dark:text-blue-400">{q}</span>
            </h2>

            {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Đang tìm kiếm...</p>
            ) : (
                <>
                    <div className="grid gap-4">
                        {results.map((user) => {
                            const { mutualCount } = friendshipMap[user.id] || {};
                            return (
                                <Link
                                    href={`/trang-ca-nhan/${user.id}`}
                                    key={user.id}
                                    className="flex items-center p-4 bg-white dark:bg-dark-card rounded-xl shadow hover:shadow-md transition-shadow"
                                >
                                    <Image
                                        src={user.avatar_url || '/default-avatar.png'}
                                        alt="avatar"
                                        width={56}
                                        height={56}
                                        className="rounded-full object-cover w-14 h-14 border"
                                    />
                                    <div className="ml-4 flex-1">
                                        <div className="text-gray-800 dark:text-gray-100 font-medium text-lg">
                                            {user.first_name} {user.last_name}
                                        </div>
                                        {mutualCount > 0 && user.id !== currentUser?.id && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                                <UserRound size={14} />
                                                {mutualCount} bạn chung
                                            </div>
                                        )}

                                        <div className="mt-1">{renderActionButton(user)}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center items-center gap-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Trước
                            </button>
                            <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
