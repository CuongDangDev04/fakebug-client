'use client';

import { useEffect, useState } from 'react';
import { commentService } from '@/services/commentService';
import CommentItem from './CommentItem';
import { useUserStore } from '@/stores/userStore';
import Link from 'next/link';

export default function CommentBox({ postId }: { postId: number }) {
    const currentUser = useUserStore(state => state.user);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');

    if (!currentUser) return null;

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
        fetchComments();
    };

    const handleNewComment = async () => {
        if (!newComment.trim()) return;
        await commentService.createComment(postId, currentUser.id, newComment);
        setNewComment('');
        fetchComments();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNewComment();
        }
    };

    //  Chỉ hiển thị bình luận cấp 1 (parent === null)
    const topLevelComments = comments.filter(c => c.parent === null);
    
    return (
        <div className="mt-4">
            {/* Ô nhập bình luận mới */}
            <div className="flex items-center py-4 px-4 rounded-xl bg-white dark:bg-dark-card gap-2 mb-4">
                <Link href={`/trang-ca-nhan/${currentUser.id}`}>
                    <img
                        src={currentUser?.avatar_url || '/default-avatar.png'}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover"
                    />
                </Link>
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Viết bình luận công khai..."
                    className="flex-1 bg-gray-200 dark:bg-[#333] rounded-full px-4 py-2 text-sm dark:text-white focus:outline-none"
                />
                <button
                    onClick={handleNewComment}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
                >
                    Gửi
                </button>
            </div>

            {/* Danh sách bình luận cấp 1 */}
            <div className="space-y-4">
                {topLevelComments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUser.id}
                        onReply={handleReply}
                        onDelete={async (commentId) => {
                            await commentService.deleteComment(commentId);
                            fetchComments();
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
