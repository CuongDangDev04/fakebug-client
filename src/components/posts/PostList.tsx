'use client';

import { useState } from 'react';
import type { FeedType } from '@/types/post';
import PostFeed from './PostFeed';

export default function PostList() {
  const [feedType, setFeedType] = useState<FeedType>('feed');

  return (
    <div className="w-full md:w-1/2 m-auto space-y-4">
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

      <PostFeed key={feedType} feedType={feedType} />
    </div>
  );
}
