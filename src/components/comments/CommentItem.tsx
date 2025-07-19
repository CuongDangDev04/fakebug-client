'use client';

import { useState } from 'react';
import ReactionButtonForComment from './ReactionButtonForComment';

export default function CommentItem({
    comment,
    currentUserId,
    onReply,
    onDelete,
}: {
    comment: any;
    currentUserId: number;
    onReply: (parentId: number, content: string) => void;
    onDelete: (commentId: number) => void;
}) {
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReply = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setReplyContent('');
        setShowReplies(true);
    };

    const currentUserReaction = comment.reactions?.find(
        (r: any) => r.user?.id === currentUserId
    )?.type || null;

    return (
        <div className="bg-white dark:bg-[#1d1d1d] rounded-xl p-3">

            {/* Nội dung comment */}
            <div className="flex items-start gap-3">
                <img
                    src={comment.user.avatar_url}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="font-semibold dark:text-white text-sm">
                        {comment.user.first_name} {comment.user.last_name}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                        {comment.content}
                    </div>

                    <div className="flex gap-3 items-center mt-1">
                        <ReactionButtonForComment
                            commentId={comment.id}
                            initialReaction={currentUserReaction}
                        />
                        <button
                            onClick={() => setShowReplies(true)}
                            className="text-xs text-blue-500"
                        >
                            Trả lời
                        </button>
                        {comment.user.id === currentUserId && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-xs text-red-500"
                            >
                                Xóa
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Form trả lời */}
            {showReplies && (
                <div className="flex items-center gap-2 mt-2 ml-12">
                    <input
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
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

            {/* Xem tất cả phản hồi */}
            {comment.replies?.length > 0 && !showReplies && (
                <button
                    onClick={() => setShowReplies(true)}
                    className="ml-12 text-xs text-gray-500 dark:text-gray-400 mt-1"
                >
                    Xem tất cả {comment.replies.length} phản hồi
                </button>
            )}

            {/* Danh sách replies */}
            {showReplies && comment.replies?.length > 0 && (
                <div className="mt-3 ml-8 border-l border-gray-300 dark:border-gray-700 pl-4 space-y-3">
                    {comment.replies.map((reply: any) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            onReply={onReply}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
