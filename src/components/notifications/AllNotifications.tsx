'use client'
import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import type Notification from '@/types/notification';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import SkeletonNotification from '@/components/skeleton/SkeletonNotification';
import { useRouter } from 'next/navigation';

export default function AllNotifications() {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                setLoading(true);
                let response;
                if (filter === 'unread') {
                    response = await notificationService.getUnreadNotification();
                    setAllNotifications(Array.isArray(response?.noti) ? response.noti : []);
                } else {
                    response = await notificationService.getAllNotificationOfUser();
                    setAllNotifications(Array.isArray(response) ? response : []);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotification();
    }, [filter]);

    const newNotifications = useNotificationStore((state) => state.notifications);

    const allCombined = useMemo(() => {
        const allIds = new Set(allNotifications.map((n) => n.id));
        const uniqueNew = newNotifications.filter((n) => !allIds.has(n.id));
        const combined = [...uniqueNew, ...allNotifications];
        return filter === 'unread' ? combined.filter(n => !n.isRead) : combined;
    }, [allNotifications, newNotifications, filter]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setAllNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNoti = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            setAllNotifications(prev => prev.filter(n => n.id !== id));
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
                        <>
                            <SkeletonNotification />
                            <SkeletonNotification />
                            <SkeletonNotification />
                            <SkeletonNotification />
                        </>
                    ) : (
                        allCombined.map((n) => (
                            <div 
                                key={n.id} 
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition ${
                                    !n.isRead ? 'bg-gray-100 dark:bg-gray-800' : ''
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
            </div>
        </div>
    );
}
