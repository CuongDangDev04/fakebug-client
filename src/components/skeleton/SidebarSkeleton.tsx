'use client';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useThemeStore } from '@/stores/themeStore';

export default function SidebarSkeleton() {
    const isDark = useThemeStore((state) => state.isDark);

    const darkModeProps = isDark
        ? {
            baseColor: '#3a3b3c',
            highlightColor: '#4e4f50',
        }
        : {};

    return (
        <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
                <Skeleton circle width={40} height={40} {...darkModeProps} />
                <div className="flex-1 space-y-2">
                    <Skeleton width="40%" height={12} {...darkModeProps} />
                    <Skeleton width="60%" height={10} {...darkModeProps} />
                </div>
            </div>

            {/* Sidebar Options */}
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton circle width={40} height={40} {...darkModeProps} />
                    <div className="flex-1 space-y-2">
                        <Skeleton width="40%" height={12} {...darkModeProps} />
                        <Skeleton width="60%" height={10} {...darkModeProps} />
                    </div>
                </div>
            ))}
        </div>
    );
}
