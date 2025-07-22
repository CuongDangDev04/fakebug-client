'use client';

import { useEffect, useState } from 'react';
import { postService } from '@/services/postService';
import PostItem from '@/components/posts/PostItem';
import CommentBox from '@/components/comments/CommentBox';
import { useUserStore } from '@/stores/userStore';
import type { PostResponse } from '@/types/post';

interface PostDetailProps {
    postId: number;
}

export default function PostDetail({ postId }: PostDetailProps) {
    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [postOwnerId, setPostOwneId] = useState<number>();
    const currentUserId = useUserStore((state) => state.user?.id);
    const [fullNamePostOwner, setFullNamePostOwner] = useState<String>('')
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await postService.getPostById(postId);
                console.log('resp', res.data)
                setPost(res.data);
                setPostOwneId(res.data.user.id)
                setFullNamePostOwner(`${res.data.user.first_name}  ${res.data.user.last_name}`)
            } catch (error) {
                console.error('Lỗi tải bài viết:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return <p className="text-center py-4">Đang tải bài viết...</p>;
    }

    if (!post) {
        return <p className="text-center py-4">Bài viết không tồn tại.</p>;
    }

    return (
        <>
            <PostItem post={post} />
            {currentUserId && (
                <CommentBox postId={post.id} postOwnerId={postOwnerId ?? 0} fullNamePostOwner={String(fullNamePostOwner) }/>
            )}
        </>
    );
}
