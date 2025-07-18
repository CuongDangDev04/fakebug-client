'use client';

import { useState } from 'react';
import { MessageCircle, Pencil } from 'lucide-react';
import type { PostResponse } from '@/types/post';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import EditPostModal from './EditPostModal';  // Giả sử bạn đã có modal này

interface PostItemProps {
    post: PostResponse;
}

export default function PostItem({ post }: PostItemProps) {
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 space-y-3">
            {/* Header */}
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
                        <p className="font-semibold text-sm dark:text-white">
                            {currentPost.user.first_name} {currentPost.user.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{formatRelativeTime(currentPost.created_at)}</p>
                    </div>
                </div>
                {/* Nút chỉnh sửa */}
                <button
                    onClick={() => setShowEditModal(true)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-hover"
                    title="Chỉnh sửa bài viết"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="text-sm dark:text-white whitespace-pre-line">
                {currentPost.content}
            </div>

            {/* Image */}
            {currentPost.media_url && (
                <div className="overflow-hidden rounded-lg">
                    <img
                        src={currentPost.media_url}
                        alt="Post Image"
                        className="object-cover w-full max-h-[500px]"
                    />
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#b0b3b8]">
                <p>
                    {likesCount} lượt thích · {currentPost.comments?.length || 0} bình luận
                </p>

            </div>

            {/* Actions */}
            <div className="flex justify-around border-t border-gray-200 dark:border-gray-700 pt-2">
                <button className="flex items-center gap-1 px-4 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover">
                     Thích
                </button>

                <button className="flex items-center gap-1 px-4 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover">
                    <MessageCircle className="w-4 h-4" />
                    Bình luận
                </button>
            </div>

            {/* Modal chỉnh sửa bài viết */}
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
