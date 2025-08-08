'use client';

import { friendshipService } from '@/services/friendshipService';
import { useState, useEffect } from 'react';
import { UserRound, UserPlus, UserMinus, Clock } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import { useUserStore } from '@/stores/userStore';
import type { Friend, FriendsResponse, StatusMap, StatusResponse } from '@/types/friendship';
import Link from 'next/link';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';
import { toast } from 'sonner';

export default function UserFriendList({ userId }: { userId: number }) {
    const [friendsData, setFriendsData] = useState<FriendsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { sendFriendRequest, unfriend, cancelFriendRequest } = useFriendship();
    const currentUser = useUserStore(state => state.user);

    useEffect(() => {
        const loadFriends = async () => {
            try {
                setLoading(true);
                const response: any = await friendshipService.getUserFriends(userId);

                if (response.data.friends.length > 0) {
                    const friendIds = response.data.friends.map((friend: Friend) => friend.id);
                    const statusResponse = await friendshipService.getFriendshipStatusBatch(friendIds);

                    const statusMap: StatusMap = {};
                    statusResponse?.data.forEach((statusObj: StatusResponse) => {
                        const status = statusObj.status || statusObj.friendshipStatus || statusObj.friendship_status;
                        if (statusObj.id && status) {
                            statusMap[statusObj.id] = status;
                        }
                    });

                    const friendsWithStatus = {
                        ...response.data,
                        friends: response.data.friends.map((friend: Friend) => {
                            const status = statusMap[friend.id];
                            return {
                                ...friend,
                                friendshipStatus: status || friend.friendshipStatus || 'NOT_FRIEND'
                            };
                        })
                    };

                    setFriendsData(friendsWithStatus);
                } else {
                    setFriendsData(response.data);
                }
            } catch (error) {
                console.error('Error loading user friends:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFriends();
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!friendsData || friendsData.friends.length === 0) {
        return <div>Không có bạn bè nào</div>;
    }

    const updateFriendStatus = (friendId: number, newStatus: Friend['friendshipStatus']) => {
        if (!friendsData) return;

        setFriendsData({
            ...friendsData,
            friends: friendsData.friends.map(friend =>
                friend.id === friendId
                    ? { ...friend, friendshipStatus: newStatus }
                    : friend
            )
        });
    };

    // Hàm gọi modal xác nhận
    const confirmFriendAction = (friend: Friend, action: () => Promise<void>) => {
        let title = '';
        let description = '';
        let successMessage = '';

        switch (friend.friendshipStatus) {
            case 'NOT_FRIEND':
                title = 'Xác nhận gửi lời mời kết bạn?';
                description = `Bạn có chắc chắn muốn gửi lời mời kết bạn tới ${friend.firstName} ${friend.lastName}?`;
                successMessage = 'Đã gửi lời mời kết bạn thành công!';
                break;
            case 'FRIEND':
                title = 'Xác nhận huỷ kết bạn?';
                description = `Bạn có chắc chắn muốn huỷ kết bạn với ${friend.firstName} ${friend.lastName}?`;
                successMessage = 'Đã huỷ kết bạn thành công!';
                break;
            case 'PENDING_SENT':
                title = 'Xác nhận huỷ lời mời kết bạn?';
                description = `Bạn có chắc chắn muốn huỷ lời mời kết bạn với ${friend.firstName} ${friend.lastName}?`;
                successMessage = 'Đã huỷ lời mời kết bạn thành công!';
                break;
            default:
                break;
        }

        ConfirmDelete({
            title,
            description,
            confirmText: 'Xác nhận',
            cancelText: 'Hủy',
            onConfirm: async () => {
                await action();
                toast.success(successMessage);
            },
        });
    };

    // Sửa lại hàm xử lý hành động bạn bè
    const handleFriendAction = async (friend: Friend) => {
        const action = async () => {
            switch (friend.friendshipStatus) {
                case 'NOT_FRIEND':
                    const success = await sendFriendRequest(friend.id);
                    if (success) updateFriendStatus(friend.id, 'PENDING_SENT');
                    break;
                case 'FRIEND':
                    const unfriended = await unfriend(friend.id);
                    if (unfriended) updateFriendStatus(friend.id, 'NOT_FRIEND');
                    break;
                case 'PENDING_SENT':
                    const cancelled = await cancelFriendRequest(friend.id);
                    if (cancelled) updateFriendStatus(friend.id, 'NOT_FRIEND');
                    break;
            }
        };

        confirmFriendAction(friend, action);
    };

    const getFriendActionButton = (friend: Friend) => {
        if (currentUser && friend.id === currentUser.id) {
            return null;
        }

        switch (friend.friendshipStatus) {
            case 'NOT_FRIEND':
                return (
                    <button
                        onClick={() => handleFriendAction(friend)}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Thêm bạn bè</span>
                    </button>
                );
            case 'FRIEND':
                return (
                    <button
                        onClick={() => handleFriendAction(friend)}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                        <UserMinus className="w-4 h-4" />
                        <span>Hủy kết bạn</span>
                    </button>
                );
            case 'PENDING_SENT':
                return (
                    <button
                        onClick={() => handleFriendAction(friend)}
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
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendsData?.friends.map((friend: Friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-lg">
                    <Link href={`/trang-ca-nhan/${friend.id}`} className="flex items-center gap-3">
                        <img
                            src={friend.avatar || '/default-avatar.png'}
                            alt={`${friend.firstName}'s avatar`}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                                {friend.firstName} {friend.lastName}
                            </h3>
                            {friend.mutualCount > 0 && currentUser && friend.id !== currentUser.id && (
                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center gap-1">
                                    <UserRound size={14} />
                                    {friend.mutualCount} bạn chung
                                </p>
                            )}
                        </div>
                    </Link>
                    {getFriendActionButton(friend)}
                </div>
            ))}
        </div>
    );
}
