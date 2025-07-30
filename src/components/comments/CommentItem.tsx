'use client';

import { useMemo, useState } from 'react';
import ReactionButtonForComment from './ReactionButtonForComment';
import type { ReactionType } from '@/types/post';
import ReactionListModal from '../posts/ReactionListModal';
import Link from 'next/link';
import { notificationService } from '@/services/notificationService';
import { useUserStore } from '@/stores/userStore';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';

function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

const reactionIcons: Record<ReactionType, string> = {
    like: '/reactions/like.svg',
    love: '/reactions/love.svg',
    haha: '/reactions/haha.svg',
    wow: '/reactions/wow.svg',
    sad: '/reactions/sad.svg',
    angry: '/reactions/angry.svg',
};

const reactionOrder: ReactionType[] = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

export default function CommentItem({
    comment,
    currentUserId,
    postId,
    cmtOwnerId,
    onReply,
    postOwnerId,
    fullNamePostOwner,
    onDelete,
}: {
    comment: any;
    currentUserId: number;
    postId: number;
    cmtOwnerId: number;
    onReply: (parentId: number, content: string) => void;
    postOwnerId: number;
    fullNamePostOwner: string;
    onDelete: (commentId: number) => void;
}) {
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [reactions, setReactions] = useState<any[]>(comment.reactions || []);
    const [showReactionList, setShowReactionList] = useState(false);
    const isLevelTwo = comment.parent !== null;
    const currentUser = useUserStore(state => state.user);
    if (!currentUser) return null;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleReply();
    };

    const handleReply = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);

        if (postOwnerId !== cmtOwnerId) {
            notificationService.sendNotification(
                cmtOwnerId,
                `${currentUser.first_name} ${currentUser.last_name} trả lời bình luận của bạn về bài viết của ${fullNamePostOwner}`,
                `/bai-viet/${postId}`,
                `${currentUser.avatar_url}`
            );
        }

        setReplyContent('');
        setShowReplies(true);
    };

    const currentUserReaction = reactions.find(
        (r: any) => r.user?.id === currentUserId
    )?.type || null;

    const { topReactions, totalReactions } = useMemo(() => {
        const counts: Record<ReactionType, number> = {
            like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0,
        };

        reactions.forEach((r: { type: ReactionType }) => {
            if (r.type in counts) counts[r.type]++;
        });

        const sorted = reactionOrder
            .map(type => ({ type, count: counts[type] }))
            .filter(r => r.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return {
            topReactions: sorted,
            totalReactions: reactions.length,
        };
    }, [reactions]);

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl p-3">
            <div className="flex items-start gap-3">
                <Link href={`/trang-ca-nhan/${comment.user.id}`}>
                    <img
                        src={comment.user.avatar_url}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover"
                    />
                </Link>
                <div className="flex-1">
                    <div className="font-semibold dark:text-white text-sm">
                        {comment.user.first_name} {comment.user.last_name}
                    </div>

                    <div className="text-sm text-gray-800 dark:text-gray-200 break-all whitespace-pre-wrap max-w-[85%] overflow-hidden">
                        {comment.content}
                    </div>



                    {totalReactions > 0 && (
                        <div
                            className="flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                            onClick={() => setShowReactionList(true)}
                        >
                            {topReactions.map(r => (
                                <img
                                    key={r.type}
                                    src={reactionIcons[r.type]}
                                    alt={r.type}
                                    className="w-4 h-4"
                                />
                            ))}
                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                {totalReactions}
                            </span>
                        </div>
                    )}

                    <div className="flex gap-3 items-center mt-1">
                        <ReactionButtonForComment
                            commentId={comment.id}
                            initialReaction={currentUserReaction}
                            initialReactions={reactions}
                            onReactionsUpdated={setReactions}
                        />

                        {!isLevelTwo && (
                            <button
                                onClick={() => setShowReplies(true)}
                                className="text-xs text-blue-500"
                            >
                                Trả lời
                            </button>
                        )}

                        {comment.user.id === currentUserId && (
                            <button
                                onClick={() => {
                                    ConfirmDelete({
                                        title: 'Xác nhận xoá bình luận?',
                                        description: 'Bình luận này sẽ bị xoá vĩnh viễn.',
                                        onConfirm: async () => {
                                            await onDelete(comment.id);
                                        },
                                        confirmText: 'Xoá',
                                        cancelText: 'Huỷ',
                                    });
                                }}
                                className="text-xs text-red-500"
                            >
                                Xoá
                            </button>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(comment.created_at)}
                        </p>
                    </div>
                </div>
            </div>

            {!isLevelTwo && showReplies && (
                <div className="flex items-center gap-2 mt-2 ml-12">
                    <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Viết phản hồi..."
                        className="flex-1 bg-gray-200 dark:bg-[#333] rounded-full px-4 py-1 text-sm dark:text-white"
                    />
                    <button
                        onClick={handleReply}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
                    >
                        Gửi
                    </button>
                </div>
            )}

            {!isLevelTwo && comment.replies?.length > 0 && !showReplies && (
                <button
                    onClick={() => setShowReplies(true)}
                    className="ml-12 text-xs text-gray-500 dark:text-gray-400 mt-1"
                >
                    Xem tất cả {comment.replies.length} phản hồi
                </button>
            )}

            {!isLevelTwo && showReplies && comment.replies?.length > 0 && (
                <div className="mt-3 ml-8 border-l border-gray-300 dark:border-gray-700 pl-4 space-y-3">
                    {comment.replies.map((reply: any) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            postId={postId}
                            cmtOwnerId={cmtOwnerId}
                            onReply={onReply}
                            postOwnerId={postOwnerId}
                            fullNamePostOwner={fullNamePostOwner}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            {showReactionList && (
                <ReactionListModal
                    users={reactions.map(r => ({
                        id: r.user.id,
                        first_name: r.user.first_name,
                        last_name: r.user.last_name,
                        avatar_url: r.user.avatar_url,
                        type: r.type,
                    }))}
                    onClose={() => setShowReactionList(false)}
                />
            )}
        </div>
    );
}
