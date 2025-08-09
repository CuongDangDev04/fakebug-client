'use client';

import { useMemo, useState } from 'react';
import { Lock, Globe, Users, MessageCircle, Pencil, Share, Trash2, Flag } from 'lucide-react';
import type { PostItemProps, ReactionType } from '@/types/post';
import { formatRelativeTime } from '@/utils/formatRelativeTime';
import EditPostModal from './EditPostModal';
import { useUserStore } from '@/stores/userStore';
import ReactionButton from './ReactionButton';
import ReactionListModal from './ReactionListModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { postService } from '@/services/postService';
import { ConfirmDelete } from '../common/ui/ConfirmDelete';
import SharePostModal from './SharePostModal';
import { toast } from 'sonner';
import ReportModal from './ReportModal';

export default function PostItem({ post, onDeleted }: PostItemProps) {
    const [currentPost, setCurrentPost] = useState(post);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReactionList, setShowReactionList] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const currentUser = useUserStore((state) => state.user);
    const router = useRouter();

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

    const handleDeletePost = () => {
        ConfirmDelete({
            title: 'Bạn có chắc chắn muốn xoá bài viết này?',
            description: 'Hành động này không thể hoàn tác.',
            onConfirm: async () => {
                await postService.deletePost(currentPost.id);
                if (typeof onDeleted === 'function') {
                    onDeleted(currentPost.id);
                    toast.success('Xoá bài viết thành công')

                } else {
                    router.refresh();
                }
            },
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
    const handleReport = async (postId: number, reason: string) => {
        try {
            const res = await postService.reportPost({ postId, reason })
            toast.success('Báo cáo bài viết thành công')
        } catch (err: any) {
            console.error("Lỗi khi báo cáo bài viết: ", err)
        }
    }

    const isOwnPost = currentUser?.id === currentPost.user.id;
    const totalComments = currentPost.comments?.length || 0;

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 space-y-3 relative">
            <div className="flex items-center justify-between">
                <Link href={`/trang-ca-nhan/${currentPost.user.id}`} className="flex items-center gap-3">
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
                </Link>

                {isOwnPost ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-hover"
                            title="Chỉnh sửa bài viết"
                        >
                            <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                            onClick={handleDeletePost}
                            className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900"
                            title="Xoá bài viết"
                        >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-300" />
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="p-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
                            title="Báo cáo bài viết"
                        >
                            <Flag className="w-4 h-4 text-yellow-600 dark:text-yellow-300" />
                        </button>

                        <ReportModal
                            isOpen={showReportModal}
                            onClose={() => setShowReportModal(false)}
                            onSubmit={(reason) => handleReport(post.id, reason)}
                        />
                    </>

                )}


            </div>

            {/* 👇 Nội dung bài viết rút gọn */}
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line relative">
                <p className={isExpanded ? '' : 'line-clamp-2'}>
                    {currentPost.content}
                </p>
                {currentPost.content.length > 120 && (
                    <button
                        onClick={() => setIsExpanded(prev => !prev)}
                        className="text-blue-500 text-sm mt-1 hover:underline"
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm...'}
                    </button>
                )}
            </div>

            {currentPost.originalPost && (
                <div className="mt-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#242526]">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                        <Link
                            href={`/trang-ca-nhan/${currentPost.originalPost.user.id}`}
                            className="flex items-center gap-2 group"
                        >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img
                                    src={currentPost.originalPost.user.avatar_url || '/default-avatar.png'}
                                    alt={`${currentPost.originalPost.user.first_name} ${currentPost.originalPost.user.last_name}`}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm group-hover:underline">
                                    {currentPost.originalPost.user.first_name} {currentPost.originalPost.user.last_name}
                                </span>
                                <time className="text-xs text-gray-500 dark:text-gray-400">
                                    {/* Bạn cần cung cấp dữ liệu thời gian gốc ở đây hoặc format lại */}
                                    {formatRelativeTime(currentPost.originalPost.created_at)}
                                </time>
                            </div>
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-3 text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap leading-relaxed">
                        {currentPost.originalPost.content}
                    </div>

                    {/* Image */}
                    {currentPost.originalPost.media_url && (
                        <Link href={`/bai-viet/${currentPost.originalPost.id}`} className="block">
                            <img
                                src={currentPost.originalPost.media_url}
                                alt="Ảnh bài viết gốc"
                                className="object-cover w-full max-h-[450px] rounded-b-lg"
                                loading="lazy"
                            />
                        </Link>
                    )}
                </div>
            )}


            {currentPost.media_url && (
                <div className="overflow-hidden rounded-lg w-full">
                    <img
                        src={currentPost.media_url}
                        alt="Post Image"
                        className="w-full h-auto object-contain mx-auto"
                    />
                </div>
            )}

            <div className="flex justify-between items-center">
                {totalReactions > 0 ? (
                    <div
                        className="flex items-center space-x-1 cursor-pointer hover:underline"
                        onClick={() => setShowReactionList(true)}
                    >
                        {topReactions.map(renderReactionIcon)}
                        <span className="text-sm text-gray-700 dark:text-gray-300">{totalReactions}</span>
                    </div>
                ) : <div />}

                {totalComments > 0 ? (
                    <Link href={`/bai-viet/${post.id}`}>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{totalComments} Bình luận</span>
                    </Link>
                ) : <div />}
            </div>

            {showReactionList && (
                <ReactionListModal
                    users={currentPost.reacted_users || []}
                    onClose={() => setShowReactionList(false)}
                />
            )}

            <div className="flex justify-around border-t border-gray-200 dark:border-gray-700 pt-2 relative">
                <ReactionButton
                    postId={post.id}
                    reactedUsers={currentPost.reacted_users ?? []}
                    onReacted={handleReaction}
                    postOwnerId={currentPost.user.id}
                />
                <Link href={`/bai-viet/${post.id}`}>
                    <button className="flex items-center gap-1 px-4 py-1 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover">
                        <MessageCircle className="w-4 h-4" />
                        Bình luận
                    </button>
                </Link>

                {currentPost.privacy === 'public' && (
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-1 px-4 py-1 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover"
                    >
                        <Share className="w-4 h-4" />
                        Chia sẻ
                    </button>
                )}
                {showShareModal && (
                    <SharePostModal
                        originalPost={currentPost.originalPost || currentPost as any}
                        isOpen={showShareModal}
                        onClose={() => setShowShareModal(false)}
                    />
                )}
            </div>

            {showEditModal && (
                <EditPostModal
                    post={currentPost}
                    originalPost={currentPost.originalPost ?? null}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdated={(updatedPost) =>
                        setCurrentPost(prev => ({
                            ...updatedPost,
                            originalPost: prev.originalPost,
                        }))
                    }
                />
            )}
        </div>
    );
}
