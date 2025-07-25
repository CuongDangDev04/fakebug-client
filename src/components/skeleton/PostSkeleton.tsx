'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useThemeStore } from '@/stores/themeStore';

export default function PostSkeleton() {
  const isDark = useThemeStore((state) => state.isDark);

  const darkModeProps = isDark
    ? {
        baseColor: '#3a3b3c',
        highlightColor: '#4e4f50',
      }
    : {};

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton circle width={40} height={40} {...darkModeProps} />
        <div className="flex-1">
          <Skeleton width={120} height={14} {...darkModeProps} />
          <Skeleton width={80} height={12} style={{ marginTop: 4 }} {...darkModeProps} />
        </div>
      </div>

      {/* Nội dung */}
      <div className="space-y-2">
        <Skeleton count={2} {...darkModeProps} />
      </div>

      {/* Hình ảnh */}
      <Skeleton height={200} {...darkModeProps} />

      {/* Reactions & Actions */}
      <div className="flex justify-between items-center mt-2">
        <Skeleton width={80} height={16} {...darkModeProps} />
        <Skeleton width={60} height={16} {...darkModeProps} />
      </div>

      <div className="flex justify-around pt-2 border-t border-gray-200 dark:border-gray-700">
        <Skeleton width={80} height={32} {...darkModeProps} />
        <Skeleton width={80} height={32} {...darkModeProps} />
        <Skeleton width={80} height={32} {...darkModeProps} />
      </div>
    </div>
  );
}
