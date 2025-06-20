import { useThemeStore } from '@/stores/themeStore';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonNotification() {
    const isDark = useThemeStore((state) => state.isDark);

    const darkModeProps = isDark
        ? {
            baseColor: '#3a3b3c',
            highlightColor: '#4e4f50',
        }
        : {};

    return (
        <div className="p-4">
            <div className="flex items-start gap-3">
                <Skeleton circle width={48} height={48} {...darkModeProps} />
                <div className="flex-1">
                    <Skeleton height={20} width="80%" {...darkModeProps} />
                    <Skeleton height={16} width="40%" className="mt-2" {...darkModeProps} />
                </div>
                <Skeleton circle width={24} height={24} {...darkModeProps} />
            </div>
        </div>
    );
}
