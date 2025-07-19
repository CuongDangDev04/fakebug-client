import { useMemo, useState } from 'react';
import { Lock, Globe, Users, MessageCircle, Pencil, Share } from 'lucide-react';
import type { PostItemProps, ReactionType } from '@/types/post';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import EditPostModal from './EditPostModal';
import { useUserStore } from '@/stores/userStore';
import ReactionButton from './ReactionButton';
import ReactionListModal from './ReactionListModal';

export default function PostItem({ post }: PostItemProps) {
    const [currentPost, setCurrentPost] = useState(post);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReactionList, setShowReactionList] = useState(false);

    const currentUser = useUserStore((state) => state.user);

    const totalReactions = currentPost.total_reactions || currentPost.reactions?.length || 0;

    const topReactions = useMemo(() => {
        const counts: Record<string, number> = {};

        currentPost.reactions?.forEach((reaction) => {
            counts[reaction.type] = (counts[reaction.type] || 0) + 1;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => type);
    }, [currentPost.reactions]);

    const handleReaction = (reaction: ReactionType | null) => {
        if (!currentUser) return;

        const existedReactionIndex = currentPost.reacted_users?.findIndex(
            (user) => user.id === currentUser.id
        );

        let updatedReactedUsers = [...(currentPost.reacted_users || [])];

        if (reaction) {
            if (existedReactionIndex !== undefined && existedReactionIndex >= 0) {
                updatedReactedUsers[existedReactionIndex] = {
                    ...updatedReactedUsers[existedReactionIndex],
                    type: reaction,
                };
            } else {
                updatedReactedUsers.push({
                    id: currentUser.id,
                    first_name: currentUser.first_name,
                    last_name: currentUser.last_name,
                    avatar_url: currentUser.avatar_url ?? undefined,
                    type: reaction,
                });
            }
        } else {
            updatedReactedUsers = updatedReactedUsers.filter(user => user.id !== currentUser.id);
        }

        setCurrentPost({
            ...currentPost,
            reacted_users: updatedReactedUsers,
            reactions: updatedReactedUsers.map(user => ({
                id: user.id,
                type: user.type,
            })),
            total_reactions: updatedReactedUsers.length,
        });
    };

    const reactions = [
        { name: 'Thích', url: '/reactions/like.svg', type: 'like' },
        { name: 'Yêu thích', url: '/reactions/love.svg', type: 'love' },
        { name: 'Haha', url: '/reactions/haha.svg', type: 'haha' },
        { name: 'Wow', url: '/reactions/wow.svg', type: 'wow' },
        { name: 'Buồn', url: '/reactions/sad.svg', type: 'sad' },
        { name: 'Phẫn nộ', url: '/reactions/angry.svg', type: 'angry' },
    ];

    const renderReactionIcon = (type: string) => {
        const reaction = reactions.find((r) => r.type === type);
        if (!reaction) return null;

        return (
            <img
                key={type}
                src={reaction.url}
                alt={reaction.name}
                title={reaction.name}
                className="w-5 h-5"
            />
        );
    };

    const renderPrivacyIcon = () => {
        switch (currentPost.privacy) {
            case 'public':
                return <Globe className="w-4 h-4 text-gray-500 inline-block ml-1" />;
            case 'friends':
                return <Users className="w-4 h-4 text-gray-500 inline-block ml-1" />;
            case 'private':
                return <Lock className="w-4 h-4 text-gray-500 inline-block ml-1" />;
            default:
                return null;
        }
    };

    const isOwnPost = currentUser?.id === currentPost.user.id;

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img
                            src={currentPost.user.avatar_url || '/default-avatar.png'}
                            alt="Avatar"
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">
                            {currentPost.user.first_name} {currentPost.user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                            {formatRelativeTime(currentPost.created_at)}
                            {renderPrivacyIcon()}
                        </p>
                    </div>
                </div>

                {isOwnPost && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-hover"
                        title="Chỉnh sửa bài viết"
                    >
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                )}
            </div>

            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {currentPost.content}
            </div>

            {currentPost.media_url && (
                <div className="overflow-hidden rounded-lg">
                    <img
                        src={currentPost.media_url}
                        alt="Post Image"
                        className="object-cover w-full max-h-[500px]"
                    />
                </div>
            )}

            {totalReactions > 0 && (
                <div
                    className="flex items-center space-x-1 cursor-pointer hover:underline"
                    onClick={() => setShowReactionList(true)}
                >
                    {topReactions.map(renderReactionIcon)}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{totalReactions}</span>
                </div>
            )}

            {showReactionList && (
                <ReactionListModal
                    users={currentPost.reacted_users || []}
                    onClose={() => setShowReactionList(false)}
                />
            )}

            <div className="flex justify-around border-t border-gray-200 dark:border-gray-700 pt-2 relative">
                <ReactionButton
                    postId={post.id}
                    reactedUsers={currentPost.reacted_users}
                    onReacted={handleReaction}
                />

                <button className="flex items-center gap-1 px-4 py-1 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover">
                    <MessageCircle className="w-4 h-4" />
                    Bình luận
                </button>

                {currentPost.privacy === 'public' && (
                    <button
                        onClick={() => {
                            alert('Tính năng chưa phát tiển!');
                        }}
                        className="flex items-center gap-1 px-4 py-1 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover"
                    >
                        <Share />
                        Chia sẻ
                    </button>
                )}
            </div>


            {showEditModal && (
                <EditPostModal
                    post={currentPost}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdated={(updatedPost) => setCurrentPost(updatedPost)}
                />
            )}
        </div>
    );
}
