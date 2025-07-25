'use client';

import { useCallback, useState } from 'react';
import { postService } from '@/services/postService';
import PostItem from './PostItem';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { FeedType, PostResponse } from '@/types/post';

function PostFeed({ feedType }: { feedType: FeedType }) {
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

      {loading && (
        <p className="text-center py-4 text-gray-600 dark:text-gray-300">
          Đang tải thêm bài viết...
        </p>
      )}

      {!hasMore && !loading && posts.length > 0 && (
        <p className="text-center py-4 text-gray-400 dark:text-gray-500">
          Bạn đã xem hết các bài viết.
        </p>
      )}
    </>
  );
}

export default function PostList() {
  const [feedType, setFeedType] = useState<FeedType>('feed');

  return (
    <div className="w-full md:w-3/4 m-auto space-y-4">
      <div className="flex justify-center flex-wrap gap-2 mb-4">
        {(['feed', 'public', 'friends', 'private'] as FeedType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFeedType(type)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              feedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-hover dark:text-white dark:hover:bg-dark-hover/80'
            }`}
          >
            {type === 'feed'
              ? 'Bảng tin tổng hợp'
              : type === 'public'
              ? 'Công khai'
              : type === 'friends'
              ? 'Bạn bè'
              : 'Chỉ mình tôi'}
          </button>
        ))}
      </div>

      {/* Component phụ để reset khi feedType thay đổi */}
      <PostFeed key={feedType} feedType={feedType} />
    </div>
  );
}
