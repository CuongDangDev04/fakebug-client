'use client';

import { postService } from '@/services/postService';
import PostItem from './PostItem';
import type { PostResponse } from '@/types/post';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function MyPostOnProfile() {
  const {
    items: posts,
    loading,
    hasMore,
    lastItemRef,
    removeItem,
  } = useInfiniteScroll<PostResponse>({
    fetchData: postService.getPostMyUser,
    limit: 5,
  });

  const handlePostDeleted = (postId: number) => {
    removeItem(postId);
  };

  return (
    <div className="w-full md:w-full m-auto space-y-4">
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        return (
          <div key={post.id} ref={isLast ? lastItemRef : null}>
            <PostItem post={post} onDeleted={handlePostDeleted} />
          </div>
        );
      })}
      {loading && (
        <p className="text-center py-4 text-gray-600 dark:text-gray-300">
          Đang tải thêm...
        </p>
      )}
      {!loading && !hasMore && (
        <p className="text-center py-4 text-gray-400 text-sm">
          Không còn bài viết nào.
        </p>
      )}
    </div>
  );
}
