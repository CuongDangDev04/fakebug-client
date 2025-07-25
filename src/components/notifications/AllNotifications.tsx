'use client';

import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import type Notification from '@/types/notification';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import SkeletonNotification from '@/components/skeleton/SkeletonNotification';
import { useRouter } from 'next/navigation';

export default function AllNotifications() {
    const LIMIT = 10;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const router = useRouter();
    const observerRef = useRef<HTMLDivElement>(null);

    const newNotifications = useNotificationStore((state) => state.notifications);

    const fetchNotifications = useCallback(async (initial = false) => {
        if (initial) {
            setLoading(true);
            setOffset(0);
        } else {
            setLoadingMore(true);
        }

        try {
            if (filter === 'unread') {
                const res = await notificationService.getUnreadNotification();
                setNotifications(res?.noti || []);
                setHasMore(false); // tất cả đã lấy hết trong một lần
            } else {
                const res = await notificationService.getAllNotificationOfUser(initial ? 0 : offset, LIMIT);
                const newData = res?.notifications || [];
                setNotifications((prev) => (initial ? newData : [...prev, ...newData]));
                setHasMore(notifications.length + newData.length < res.total);
                if (initial) setOffset(LIMIT);
                else setOffset((prev) => prev + LIMIT);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            if (initial) setLoading(false);
            else setLoadingMore(false);
        }
    }, [filter, offset]);

    useEffect(() => {
        fetchNotifications(true); // fetch khi mount hoặc filter đổi
    }, [filter]);

    useEffect(() => {
        if (!hasMore || filter === 'unread') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNotifications();
                }
            },
            { threshold: 1.0 }
        );

        const current = observerRef.current;
        if (current) observer.observe(current);
        return () => {
            if (current) observer.unobserve(current);
        };
    }, [hasMore, filter, fetchNotifications]);

    const allCombined = useMemo(() => {
        const seenIds = new Set<number>();
        const merged = [...newNotifications, ...notifications];

        const deduped = merged.filter((noti) => {
            if (seenIds.has(noti.id)) return false;
            seenIds.add(noti.id);
            return true;
        });

        return filter === 'unread' ? deduped.filter(n => !n.isRead) : deduped;
    }, [notifications, newNotifications, filter]);


    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNoti = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            useNotificationStore.getState().removeNotification(id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">Thông báo</h1>
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full ${filter === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text-primary'
                                }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-full ${filter === 'unread'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text-primary'
                                }`}
                        >
                            Chưa đọc
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-dark-border">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => <SkeletonNotification key={i} />)
                    ) : (
                        allCombined.map((n) => (
                            <div
                                key={n.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition ${!n.isRead ? 'bg-gray-100 dark:bg-gray-800' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <img
                                        src={n.avt}
                                        alt="notification icon"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => {
                                            handleMarkAsRead(n.id);
                                            router.push(n.url);
                                        }}
                                    >
                                        <p className="text-sm text-gray-800 dark:text-dark-text-primary">
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNoti(n.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {loadingMore && <SkeletonNotification />}
                <div ref={observerRef} className="h-2" />
            </div>
        </div>
    );
}
