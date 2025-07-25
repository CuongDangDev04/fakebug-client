'use client';

import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import type Notification from '@/types/notification';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import SkeletonNotification from '../skeleton/SkeletonNotification';

const LIMIT = 10;

export default function NotificationList() {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const newNotifications = useNotificationStore((state) => state.notifications);
    const removeNotification = useNotificationStore((state) => state.removeNotification);

    const fetchNotifications = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
        const currentOffset = allNotifications.length; // ✅ Đếm theo số lượng hiện tại
        const res = await notificationService.getAllNotificationOfUser(currentOffset, LIMIT);

        setAllNotifications((prev) => {
            const merged = [...prev, ...res.notifications];
            const uniqueMap = new Map<number, Notification>();
            merged.forEach((n) => uniqueMap.set(n.id, n));
            return Array.from(uniqueMap.values());
        });

        if (res.notifications.length < LIMIT) {
            setHasMore(false);
        }
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
    } finally {
        setLoading(false);
    }
}, [allNotifications.length, loading, hasMore]);


    useEffect(() => {
        fetchNotifications();
    }, []);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchNotifications();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [fetchNotifications, hasMore, loading]);

    // Combine from API + Store and remove duplicates
    const allCombined = useMemo(() => {
        const combined = [...newNotifications, ...allNotifications];
        const uniqueMap = new Map<number, Notification>();
        combined.forEach((n) => {
            uniqueMap.set(n.id, n);
        });
        return Array.from(uniqueMap.values());
    }, [allNotifications, newNotifications]);

    const handleDeleteNoti = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            setAllNotifications((prev) => prev.filter((n) => n.id !== id));
            removeNotification(id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setAllNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {allCombined.map((n) => (
                <li
                    key={n.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition ${
                        !n.isRead ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="flex-1 flex items-start gap-3 cursor-pointer"
                            onClick={() => {
                                handleMarkAsRead(n.id);
                                router.push(n.url);
                            }}
                        >
                            <img
                                src={n.avt}
                                alt="notification icon"
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/default-avatar.png';
                                }}
                            />
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-dark-text-primary">
                                    {n.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                                    {new Date(n.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNoti(n.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                </li>
            ))}

            {allCombined.length === 0 && !loading && (
                <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Không có thông báo nào.
                </li>
            )}

            {loading && (
                <div>
                     <SkeletonNotification />
                </div>
            )}

            <div ref={observerRef} className="h-4" />
        </ul>
    );
}
