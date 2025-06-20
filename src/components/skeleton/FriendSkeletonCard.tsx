// src/components/common/users/FriendSkeletonCard.tsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useThemeStore } from '@/stores/themeStore';

export default function FriendSkeletonCard() {
  const isDark = useThemeStore((state) => state.isDark);

  const darkModeProps = isDark
    ? {
        baseColor: '#3a3b3c',
        highlightColor: '#4e4f50',
      }
    : {};

  return (
    <div className="flex items-center px-4 sm:px-6 py-4 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
      {/* Avatar Skeleton */}
      <div className="rounded-full object-cover w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] overflow-hidden">
        <Skeleton circle height="100%" width="100%" {...darkModeProps} />
      </div>

      {/* Info Skeleton */}
      <div className="ml-3 sm:ml-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
          <div className="w-full max-w-[200px] sm:max-w-[300px]">
            <Skeleton height={18} className="mb-1" {...darkModeProps} />
            <Skeleton height={14} width="60%" {...darkModeProps} />
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-2">
            <Skeleton height={36} width={90} className="rounded-full" {...darkModeProps} />
            <Skeleton height={36} width={110} className="rounded-full" {...darkModeProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
