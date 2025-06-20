import { friendshipService } from '@/services/friendshipService';
import { useState, useEffect } from 'react';
import { UserRound, UserPlus, UserMinus, Clock } from 'lucide-react'; // Remove UserCheck
import { useFriendship } from '@/hooks/useFriendship';
import { useUserStore } from '@/stores/userStore';
import type { Friend, FriendsResponse, StatusMap, StatusResponse } from '@/types/friendship';
import Link from 'next/link';


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
                    console.log('Status response detail:', statusResponse);

                    // Convert array to object map
                    const statusMap: StatusMap = {};
                    statusResponse.data.forEach((statusObj: StatusResponse) => {
                        console.log('Full status object:', statusObj);
                        // Check all possible status properties
                        const status = statusObj.status || statusObj.friendshipStatus || statusObj.friendship_status;
                        console.log(`Extracted status for ${statusObj.id}:`, status);
                        if (statusObj.id && status) {
                            statusMap[statusObj.id] = status;
                        }
                    });

                    console.log('Final status map:', statusMap);

                    const friendsWithStatus = {
                        ...response.data,
                        friends: response.data.friends.map((friend: Friend) => { // Add Friend type here
                            const status = statusMap[friend.id];
                            console.log(`Setting status for friend ${friend.id}:`, status);
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

    const handleFriendAction = async (friend: Friend) => {
        switch (friend.friendshipStatus) {
            case 'NOT_FRIEND':
                const success = await sendFriendRequest(friend.id);
                if (success) {
                    updateFriendStatus(friend.id, 'PENDING_SENT');
                }
                break;
            case 'FRIEND':
                const unfriended = await unfriend(friend.id);
                if (unfriended) {
                    updateFriendStatus(friend.id, 'NOT_FRIEND');
                }
                break;
            case 'PENDING_SENT':
                const cancelled = await cancelFriendRequest(friend.id);
                if (cancelled) {
                    updateFriendStatus(friend.id, 'NOT_FRIEND');
                }
                break;
        }
    };

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

    const getFriendActionButton = (friend: Friend) => {
        // Không hiển thị nút nếu friend.id trùng với ID của current user
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

