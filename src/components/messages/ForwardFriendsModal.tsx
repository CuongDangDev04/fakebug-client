import { useEffect, useState } from 'react';
import { friendshipService } from '@/services/friendshipService';

interface Friend {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string | null;
}

interface ForwardFriendsModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (friendId: number) => void;
}

export default function ForwardFriendsModal({ visible, onClose, onSelect }: ForwardFriendsModalProps) {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) fetchFriends();
    }, [visible]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const res = await friendshipService.getMyFriends();
            const friendList = res || [];
            setFriends(friendList);
        } catch (error) {
            console.error('Lỗi tải danh sách bạn bè:', error);
            setFriends([]);
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/10 dark:bg-black/10">
            <div className="bg-white dark:bg-dark-card rounded-xl p-4 w-80 max-h-[80vh] overflow-y-auto shadow-xl border dark:border-dark-border">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Chọn bạn bè để chuyển tiếp
                </h2>

                {loading ? (
                    <p className="text-gray-500 dark:text-dark-text-secondary">Đang tải...</p>
                ) : friends.length === 0 ? (
                    <p className="text-gray-500 dark:text-dark-text-secondary">Không có bạn bè nào.</p>
                ) : (
                    friends.map(friend => (
                        <div
                            key={friend.id}
                            className="flex items-center justify-between mb-2 border-b pb-2 border-gray-200 dark:border-dark-border"
                        >
                            <div className="flex items-center space-x-2">
                                <img
                                    src={friend.avatar || '/default-avatar.png'}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="truncate max-w-[120px] text-gray-800 dark:text-white">
                                    {friend.firstName} {friend.lastName}
                                </span>
                            </div>
                            <button
                                onClick={() => onSelect(friend.id)}
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                                Chọn
                            </button>
                        </div>
                    ))
                )}

                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-gray-300 dark:bg-dark-hover text-gray-800 dark:text-white rounded py-1 hover:bg-gray-400 dark:hover:bg-dark-light"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}
