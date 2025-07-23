'use client';

import { useEffect, useState, useCallback } from 'react';
import { postService } from '@/services/postService';
import PostItem from './PostItem';
import type { FeedType, PostResponse } from '@/types/post';

export default function PostList() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState<FeedType>('feed');

  const fetchPosts = useCallback(async (type: FeedType) => {
    setLoading(true);
    try {
      let res;
      if (type === 'feed') {
        res = await postService.getAllVisiblePosts();
      } else if (type === 'public') {
        res = await postService.getPublicPosts();
      } else if (type === 'friends') {
        res = await postService.getFriendPosts();
      } else {
        res = await postService.getPrivatePosts();
      }
      setPosts(res.data || []);
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(feedType);
  }, [feedType, fetchPosts]);

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="w-full md:w-3/4 m-auto space-y-4">
      {/* Tabs chọn loại bài viết */}
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

      {/* Danh sách bài viết */}
      {loading ? (
        <p className="text-center py-4 text-gray-600 dark:text-gray-300">
          Đang tải bài viết...
        </p>
      ) : posts.length === 0 ? (
        <p className="text-center py-4 text-gray-600 dark:text-gray-300">
          Chưa có bài viết nào.
        </p>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} onDeleted={handlePostDeleted} />
        ))
      )}
    </div>
  );
}
