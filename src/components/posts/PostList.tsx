'use client';

import { useEffect, useState } from 'react';
import { postService } from '@/services/postService';
import PostItem from './PostItem';
import type { PostResponse } from '@/types/post';

export default function PostList() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await postService.getAllPosts();
        setPosts(res.data || []);
      } catch (err) {
        console.error('Lỗi tải bài viết:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p className="text-center py-4">Đang tải bài viết...</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center py-4">Chưa có bài viết nào.</p>;
  }

  return (
    <div className="space-y-4  w-full md:w-3/4 m-auto">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
