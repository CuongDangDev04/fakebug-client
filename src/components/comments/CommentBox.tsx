'use client';

import { useEffect, useRef, useState } from 'react';
import { commentService } from '@/services/commentService';
import CommentItem from './CommentItem';
import { useUserStore } from '@/stores/userStore';
import Link from 'next/link';
import { notificationService } from '@/services/notificationService';
import TextareaAutosize from 'react-textarea-autosize';

export default function CommentBox({ postId, postOwnerId, fullNamePostOwner }: { postId: number, postOwnerId: number, fullNamePostOwner: string }) {
    const currentUser = useUserStore(state => state.user);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    if (!currentUser) return null;

    // Focus textarea khi component mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);
    const fetchComments = async () => {
        const res = await commentService.getCommentsByPost(postId);
        if (res) setComments(res);
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleReply = async (parentId: number, content: string) => {
        if (!content.trim()) return;
        await commentService.createComment(postId, currentUser.id, content, parentId);
        await fetchComments();

        if (currentUser.id !== postOwnerId) {
            await notificationService.sendNotification(
                postOwnerId,
                `${currentUser.first_name} ${currentUser.last_name} đã trả lời bình luận về bài viết của bạn`,
                `/bai-viet/${postId}`,
                `${currentUser.avatar_url}`
            );
        }
    };

    const handleNewComment = async () => {
        if (!newComment.trim()) return;
        await commentService.createComment(postId, currentUser.id, newComment);

        if (currentUser.id !== postOwnerId) {
            await notificationService.sendNotification(
                postOwnerId,
                `${currentUser.first_name} ${currentUser.last_name} đã bình luận về bài viết của bạn`,
                `/bai-viet/${postId}`,
                `${currentUser.avatar_url}`
            );
        }

        setNewComment('');
        await fetchComments();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNewComment();
        }
    };

    const topLevelComments = comments.filter(c => c.parent === null);

    return (
        <div className="mt-4">
            <div className="flex items-center py-4 px-4 rounded-xl bg-white dark:bg-dark-card gap-2 mb-4">
                <Link href={`/trang-ca-nhan/${currentUser.id}`}>
                    <img
                        src={currentUser?.avatar_url || '/default-avatar.png'}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover"
                    />
                </Link>
                <TextareaAutosize
                    value={newComment}
                    ref={textareaRef}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Viết bình luận công khai..."
                    minRows={1}
                    maxRows={3}
                    className="flex-1 bg-gray-100 dark:bg-[#333] rounded-xl px-4 py-2 text-sm dark:text-white focus:outline-none resize-none overflow-y-auto"
                />

                <button
                    onClick={handleNewComment}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
                >
                    Gửi
                </button>
            </div>

            <div className="space-y-4">
                {topLevelComments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUser.id}
                        postId={postId}
                        cmtOwnerId={comment.user.id || null}
                        onReply={handleReply}
                        postOwnerId={postOwnerId}
                        fullNamePostOwner={fullNamePostOwner}
                        onDelete={async (commentId) => {
                            await commentService.deleteComment(commentId);
                            await fetchComments();
                        }}
                        parentIdOfParent={comment.id} // comment cha có parentIdOfParent là chính nó
                    />
                ))}
            </div>
        </div>
    );
}
