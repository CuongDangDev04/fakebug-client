'use client';

import { useCallback } from 'react';
import { postService } from '@/services/postService';
import PostItem from './PostItem';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { FeedType, PostResponse } from '@/types/post';
import PostSkeleton from '../skeleton/PostSkeleton';

export default function PostFeed({ feedType }: { feedType: FeedType }) {
  const fetchPosts = useCallback(
    async (offset: number, limit: number): Promise<PostResponse[]> => {
      try {
        let res;
        if (feedType === 'feed') {
          res = await postService.getAllVisiblePosts(offset, limit);
        } else if (feedType === 'public') {
          res = await postService.getPublicPosts(offset, limit);
        } else if (feedType === 'friends') {
          res = await postService.getFriendPosts(offset, limit);
        } else {
          res = await postService.getPrivatePosts(offset, limit);
        }
        return res || [];
      } catch (err) {
        console.error('Lỗi khi tải bài viết:', err);
        return [];
      }
    },
    [feedType]
  );

  const {
    items: posts,
    loading,
    hasMore,
    lastItemRef,
    removeItem,
  } = useInfiniteScroll<PostResponse>({ fetchData: fetchPosts, limit: 5 });

  const handlePostDeleted = (postId: number) => {
    removeItem(postId);
  };

  return (
    <>
      {posts.length === 0 && !loading ? (
        <p className="text-center py-4 text-gray-600 dark:text-gray-300">
          Chưa có bài viết nào.
        </p>
      ) : (
        posts.map((post, index) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastItemRef : undefined}
          >
            <PostItem post={post} onDeleted={handlePostDeleted} />
          </div>
        ))
      )}

      {loading && <PostSkeleton />}

      {!hasMore && !loading && posts.length > 0 && (
        <p className="text-center py-4 text-gray-400 dark:text-gray-500">
          Bạn đã xem hết các bài viết.
        </p>
      )}
    </>
  );
}
