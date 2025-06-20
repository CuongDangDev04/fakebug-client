import { useThemeStore } from '@/stores/themeStore';
import Skeleton from 'react-loading-skeleton';

export default function SkeletonProfile() {
  const isDark = useThemeStore((state) => state.isDark);

  const darkModeProps = isDark
    ? {
        baseColor: '#3a3b3c',
        highlightColor: '#4e4f50',
      }
    : {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-8 dark:bg-[#18191a] dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        <div>
          <Skeleton circle width={160} height={160} {...darkModeProps} />
        </div>
        <div className="flex-1 w-full text-center md:text-left space-y-2">
          <Skeleton height={30} width={200} {...darkModeProps} />
          <Skeleton height={20} width={100} {...darkModeProps} />
          <div className="flex gap-2 justify-center md:justify-start">
            <Skeleton height={36} width={120} {...darkModeProps} />
            <Skeleton height={36} width={160} {...darkModeProps} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4">
        <Skeleton height={40} width={100} {...darkModeProps} />
        <Skeleton height={40} width={100} {...darkModeProps} />
        <Skeleton height={40} width={100} {...darkModeProps} />
      </div>

      {/* Posts + Friends */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-[40%]">
          <Skeleton height={300} {...darkModeProps} />
        </div>
        <div className="w-full lg:w-[60%] space-y-3">
          <Skeleton height={150} {...darkModeProps} />
          <Skeleton height={150} {...darkModeProps} />
        </div>
      </div>
    </div>
  );
}
