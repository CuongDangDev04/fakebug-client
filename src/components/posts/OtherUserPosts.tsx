'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { postService } from '@/services/postService';
import PostItem from './PostItem';
import type { PostResponse } from '@/types/post';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PostSkeleton from '../skeleton/PostSkeleton';

export default function OtherUserPosts() {
  const params = useParams();
  const userId = Number(params.userId); // Lấy từ /profile/[userId]

  const {
    items: posts,
    loading,
    hasMore,
    lastItemRef,
    removeItem,
  } = useInfiniteScroll<PostResponse>({
    fetchData: (offset, limit) => postService.getPostOfOtherUser(userId, offset, limit),
    limit: 5,
  });

  useEffect(() => {
  }, [userId]);

  const handlePostDeleted = (postId: number) => {
    removeItem(postId);
  };

  return (
    <div className="w-full md:w-full bg-gray-100 dark:bg-dark-bg m-auto space-y-4">
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        return (
          <div key={post.id} ref={isLast ? lastItemRef : null}>
            <PostItem post={post} onDeleted={handlePostDeleted} />
          </div>
        );
      })}

      {loading && <PostSkeleton />}

      {!loading && !hasMore && (
        <p className="text-center py-4 text-gray-400 text-sm">
          Không còn bài viết nào.
        </p>
      )}
    </div>
  );
}
