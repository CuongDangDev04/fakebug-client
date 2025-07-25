'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useThemeStore } from '@/stores/themeStore';

export default function ChatBoxSkeleton() {
  const isDark = useThemeStore((state) => state.isDark);

  const darkModeProps = isDark
    ? {
        baseColor: '#3a3b3c',
        highlightColor: '#4e4f50',
      }
    : {};

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle width={40} height={40} {...darkModeProps} />
        <Skeleton width="30%" height={14} {...darkModeProps} />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex">
            <Skeleton width={`${60 + Math.random() * 30}%`} height={18} {...darkModeProps} />
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-auto pt-4">
        <Skeleton height={40} {...darkModeProps} />
      </div>
    </div>
  );
}
