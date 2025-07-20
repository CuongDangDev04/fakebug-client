'use client';

import { ReactionListModalProps } from '@/types/post';
import { MessageCircleMore } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFriendship } from '@/hooks/useFriendship';
import { useUserStore } from '@/stores/userStore';

const reactions = [
    { name: 'Tất cả', url: '', type: 'all' },
    { name: 'Thích', url: '/reactions/like.svg', type: 'like' },
    { name: 'Yêu thích', url: '/reactions/love.svg', type: 'love' },
    { name: 'Haha', url: '/reactions/haha.svg', type: 'haha' },
    { name: 'Wow', url: '/reactions/wow.svg', type: 'wow' },
    { name: 'Buồn', url: '/reactions/sad.svg', type: 'sad' },
    { name: 'Phẫn nộ', url: '/reactions/angry.svg', type: 'angry' },
];

export default function ReactionListModal({ users, onClose }: ReactionListModalProps) {
    const [activeTab, setActiveTab] = useState('all');
    const { checkMutualFriends } = useFriendship();
    const [mutualCounts, setMutualCounts] = useState<Record<number, number>>({});
    const currentUser = useUserStore((state) => state.user);

    useEffect(() => {
        const fetchMutualFriends = async () => {
            const counts: Record<number, number> = {};

            for (const user of users) {
                const mutualFriends = await checkMutualFriends(user.id);
                counts[user.id] = mutualFriends?.total || 0;
            }

            setMutualCounts(counts);
        };

        fetchMutualFriends();
    }, [users]);

    //  Thêm sự kiện handleKeyDown
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const filteredUsers = activeTab === 'all'
        ? users
        : users.filter(user => user.type === activeTab);

    const visibleReactions = reactions.filter(reaction => {
        if (reaction.type === 'all') return true;
        return users.some(user => user.type === reaction.type);
    });

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-[#242526] rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 border-b dark:border-[#3e4042]">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                        {visibleReactions.map(reaction => {
                            const count = reaction.type === 'all'
                                ? users.length
                                : users.filter(u => u.type === reaction.type).length;

                            if (reaction.type !== 'all' && count === 0) return null;

                            return (
                                <button
                                    key={reaction.type}
                                    onClick={() => setActiveTab(reaction.type)}
                                    className={`font-medium text-sm px-2 py-1 rounded flex items-center ${activeTab === reaction.type
                                        ? 'text-blue-500 border-b-2 border-blue-500'
                                        : 'text-gray-600 dark:text-[#b0b3b8]'
                                        }`}
                                >
                                    {reaction.type === 'all' ? (
                                        <>
                                            {reaction.name}
                                            <span className="ml-1">{count}</span>
                                        </>
                                    ) : (
                                        <>
                                            <img
                                                src={reaction.url}
                                                alt={reaction.name}
                                                className="w-5 h-5"
                                            />
                                            <span className="ml-1">{count}</span>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
                    {filteredUsers.length === 0 && (
                        <p className="text-center text-sm text-gray-500 dark:text-[#b0b3b8]">Không có ai.</p>
                    )}

                    {filteredUsers.map(user => {
                        const reaction = reactions.find(r => r.type === user.type);
                        const isCurrentUser = user.id === currentUser?.id;

                        return (
                            <div key={user.id} className="flex items-center justify-between">
                                <Link href={`/trang-ca-nhan/${user.id}`} className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <img
                                            src={user.avatar_url || '/default-avatar.png'}
                                            alt={user.first_name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {reaction && (
                                            <img
                                                src={reaction.url}
                                                alt={reaction.name}
                                                className="w-4 h-4 absolute -bottom-1 -right-1 bg-white dark:bg-[#242526] rounded-full p-[1px]"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-medium dark:text-white">
                                            {user.first_name} {user.last_name}
                                        </p>

                                        {!isCurrentUser && (
                                            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                                                {mutualCounts[user.id] !== undefined
                                                    ? `${mutualCounts[user.id]} bạn chung`
                                                    : 'Đang tải...'}
                                            </p>
                                        )}
                                    </div>
                                </Link>

                                {!isCurrentUser && (
                                    <Link href={`/tin-nhan/${user.id}`}>
                                        <button className="text-sm flex flex-row items-center bg-[#e4e6eb] dark:bg-[#3a3b3c] hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] text-black dark:text-white px-3 py-1 rounded-lg">
                                            <MessageCircleMore /> Nhắn tin
                                        </button>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
