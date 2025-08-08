'use client'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useThemeStore } from '@/stores/themeStore';

export default function BlockedUserSkeleton() {
  const isDark = useThemeStore((state) => state.isDark);

  const darkModeProps = isDark
    ? {
        baseColor: '#3a3b3c',
        highlightColor: '#4e4f50',
      }
    : {};

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-card rounded-lg">
      <div className="flex items-center gap-3">
        {/* Avatar Skeleton */}
        <div className="w-14 h-14 rounded-full overflow-hidden">
          <Skeleton circle height="100%" width="100%" {...darkModeProps} />
        </div>

        {/* Info Skeleton */}
        <div>
          <Skeleton height={20} width={120} style={{ marginBottom: 6 }} {...darkModeProps} />
          <Skeleton height={14} width={60} {...darkModeProps} />
        </div>
      </div>

      {/* Button Skeleton */}
      <Skeleton height={36} width={90} className="rounded-full" {...darkModeProps} />
    </div>
  );
}
