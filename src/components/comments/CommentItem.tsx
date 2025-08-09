'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import ReactionButtonForComment from './ReactionButtonForComment';
import type { ReactionType } from '@/types/post';
import ReactionListModal from '../posts/ReactionListModal';
import Link from 'next/link';
import { notificationService } from '@/services/notificationService';
import { useUserStore } from '@/stores/userStore';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { useEmojiPicker } from '@/hooks/useEmojiPicker';
import { Laugh, SendHorizontal } from 'lucide-react';
import EmojiPickerComponent from '../common/ui/EmojiPickerComponent';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

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
    parentIdOfParent,
}: {
    comment: any;
    currentUserId: number;
    postId: number;
    cmtOwnerId: number;
    onReply: (parentId: number, content: string) => void;
    postOwnerId: number;
    fullNamePostOwner: string;
    onDelete: (commentId: number) => void;
    parentIdOfParent: number;
}) {
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [reactions, setReactions] = useState<any[]>(comment.reactions || []);
    const [showReactionList, setShowReactionList] = useState(false);
    const isLevelTwo = comment.parent !== null;
    const currentUser = useUserStore(state => state.user);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null!);

    const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiSelect } = useEmojiPicker(
        (emoji: string) => setReplyContent(replyContent + emoji),
        buttonRef
    );

    if (!currentUser) return null;

    // Focus input mỗi khi showReplies chuyển từ false sang true
    useEffect(() => {
        if (showReplies) {
            replyInputRef.current?.focus();
        }
    }, [showReplies]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleReply();
        }
    };

    const handleReply = () => {
        if (!replyContent.trim()) return;

        onReply(parentIdOfParent, replyContent);

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
        setShowEmojiPicker(false); // Đóng picker sau khi gửi reply
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

    // Chỉnh nút Trả lời chỉ mở input, không đóng, và focus tự động
    const handleReplyButtonClick = () => {
        if (!showReplies) {
            setShowReplies(true);
        }
    };

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

                        <button
                            onClick={handleReplyButtonClick}
                            className="text-xs text-blue-500"
                        >
                            Trả lời
                        </button>

                        {comment.user.id === currentUserId && (
                            <button
                                onClick={() => {
                                    ConfirmDelete({
                                        title: 'Xác nhận xoá bình luận?',
                                        description: 'Bình luận này sẽ bị xoá vĩnh viễn.',
                                        onConfirm: async () => {
                                            await onDelete(comment.id);
                                            toast.success("Xoá bình luận thành công")
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

            {showReplies && (
                <div className="flex items-center gap-2 mt-2 ml-12 relative">
                    <TextareaAutosize
                        ref={replyInputRef}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Viết phản hồi..."
                        minRows={1}
                        maxRows={3}
                        className="flex-1 bg-gray-100 dark:bg-[#333] rounded-xl px-4 py-1 text-sm dark:text-white resize-none overflow-y-auto"
                    />
                    <button
                        ref={buttonRef}
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="text-[#65676b] dark:text-[#b0b3b8] hover:text-[#0084ff] p-2"
                    >
                        <Laugh size={20} />
                    </button>
                    <EmojiPickerComponent
                        show={showEmojiPicker}
                        onEmojiSelect={handleEmojiSelect}
                        emojiPickerRef={emojiPickerRef}
                    />
                    <button
                        onClick={handleReply}
                        className=" hover:text-blue-600 px-3 py-1 "
                        disabled={!replyContent.trim()}
                    >
                    <SendHorizontal size={20} />
                        
                    </button>
                </div>
            )}

            {comment.replies?.length > 0 && (
                <div className="mt-3 ml-8 border-l border-gray-300 dark:border-gray-700 pl-4 space-y-3">
                    {comment.replies.map((reply: any) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            postId={postId}
                            cmtOwnerId={reply.user.id || null}
                            onReply={onReply}
                            postOwnerId={postOwnerId}
                            fullNamePostOwner={fullNamePostOwner}
                            onDelete={onDelete}
                            parentIdOfParent={comment.id}
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