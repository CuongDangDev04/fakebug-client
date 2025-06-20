import { useState, useEffect } from 'react';
import { UserRound, UserMinus } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import { useUserStore } from '@/stores/userStore';
import type { Friend, FriendsResponse } from '@/types/friendship';
import Link from 'next/link';

export default function MyProfileFriends() {
    const [friendsData, setFriendsData] = useState<FriendsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { unfriend, getOtherUserFriends } = useFriendship();
    const currentUser = useUserStore(state => state.user);

    useEffect(() => {
        const loadFriends = async () => {
            if (!currentUser?.id) return;
            
            try {
                setLoading(true);
                const response = await getOtherUserFriends(currentUser.id);
                setFriendsData(response);
            } catch (error) {
                console.error('Error loading friends:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFriends();
    }, [currentUser?.id]);

    const handleUnfriend = async (friendId: number) => {
        const success = await unfriend(friendId);
        if (success && friendsData) {
            setFriendsData({
                ...friendsData,
                friends: friendsData.friends.filter(friend => friend.id !== friendId)
            });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!friendsData || friendsData.friends.length === 0) {
        return <div>Không có bạn bè nào</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendsData.friends.map((friend: Friend) => (
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
                            {friend.mutualCount > 0 && (
                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center gap-1">
                                    <UserRound size={14} />
                                    {friend.mutualCount} bạn chung
                                </p>
                            )}
                        </div>
                    </Link>
                    <button
                        onClick={() => handleUnfriend(friend.id)}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-hover dark:hover:bg-dark-active text-gray-700 dark:text-dark-text-primary px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                        <UserMinus className="w-4 h-4" />
                        <span>Hủy kết bạn</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
