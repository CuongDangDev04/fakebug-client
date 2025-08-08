'use client';

import { useEffect, useState } from 'react';
import { postService } from '@/services/postService';
import PostItem from '@/components/posts/PostItem';
import CommentBox from '@/components/comments/CommentBox';
import { useUserStore } from '@/stores/userStore';
import type { PostResponse } from '@/types/post';
import { useRouter } from 'next/navigation';
import PostSkeleton from '../skeleton/PostSkeleton';
import Link from 'next/link';
import { House } from 'lucide-react';
import Image from 'next/image';

interface PostDetailProps {
    postId: number;
}


export default function PostDetail({ postId }: PostDetailProps) {
    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [postOwnerId, setPostOwneId] = useState<number>();
    const currentUserId = useUserStore((state) => state.user?.id);
    const [fullNamePostOwner, setFullNamePostOwner] = useState<String>('');
    const router = useRouter();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await postService.getPostById(postId);
                setPost(res?.data);
                setPostOwneId(res?.data.user.id)
                setFullNamePostOwner(`${res?.data.user.first_name}  ${res?.data.user.last_name}`)
            } catch (error) {
                console.error('Lỗi tải bài viết:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div>
                <PostSkeleton />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                {/* Logo Website */}
                <Image
                    src="/lg.png"
                    alt="Website Logo"
                    width={100}
                    height={100}
                    className="mb-6 drop-shadow-md"
                    priority
                />

                {/* Tiêu đề */}
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text-primary">
                    Bài viết không tồn tại
                </h2>

                {/* Mô tả */}
                <p className="mt-2 text-gray-500 dark:text-dark-text-secondary max-w-md">
                    Có thể bài viết đã bị xóa, bị ẩn bởi chủ sở hữu hoặc đường dẫn không chính xác.
                </p>

                {/* Hành động */}
                <div className="mt-6 flex gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2 text-white font-medium shadow hover:bg-primary-600 dark:bg-dark-button-primary dark:hover:bg-dark-button-hover transition-colors duration-200"
                    >
                        <House size={18} /> Trang chủ
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>
        );
    }



    return (
        <>
            <PostItem
                post={post}
                onDeleted={() => {
                    router.push('/'); // chuyển hướng về home sau khi xoá
                }}
            />
            {currentUserId && (
                <CommentBox
                    postId={post.id}
                    postOwnerId={postOwnerId ?? 0}
                    fullNamePostOwner={String(fullNamePostOwner)}
                />
            )}
        </>
    );
}

