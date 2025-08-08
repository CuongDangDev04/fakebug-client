'use client'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useThemeStore } from '@/stores/themeStore';

export default function SentRequestSkeleton() {
  const isDark = useThemeStore((state) => state.isDark);

  const darkModeProps = isDark
    ? {
        baseColor: '#3a3b3c',
        highlightColor: '#4e4f50',
      }
    : {};

  return (
    <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border">
      {/* Avatar skeleton */}
      <div className="w-16 h-16 sm:w-[90px] sm:h-[90px] rounded-full overflow-hidden">
        <Skeleton circle height="100%" width="100%" {...darkModeProps} />
      </div>

      {/* Info skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton height={20} width="50%" {...darkModeProps} />
        <Skeleton height={14} width="30%" {...darkModeProps} />
        <Skeleton height={32} width={112} className="rounded-full" {...darkModeProps} />
      </div>
    </div>
  );
}
