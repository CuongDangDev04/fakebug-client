'use client';

import { useEffect, useState, useCallback } from 'react';
import { postService } from '@/services/postService';
import PostItem from './PostItem';
import type { PostResponse } from '@/types/post';

export default function MyPostOnProfile() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postService.getPostMyUser();
      setPosts(res || []);
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="w-full md:w-full m-auto space-y-4">

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
