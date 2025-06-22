'use client'
import { notificationService } from '@/services/notificationService';
import { useNotificationStore } from '@/stores/notificationStore';
import type Notification from '@/types/notification';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react'

export default function NotificationList() {
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchNotification = async () => {
            const response = await notificationService.getAllNotificationOfUser();
            setAllNotifications(response)
        }
        fetchNotification()
    }, [])

    const newNotifications = useNotificationStore((state) => state.notifications)

    const allCombined = useMemo(() => {
        const allIds = new Set(allNotifications.map((n) => n.id));
        const uniqueNew = newNotifications.filter((n) => !allIds.has(n.id));
        return [...uniqueNew, ...allNotifications];
    }, [allNotifications, newNotifications])
 
    const handleDeleteNoti = async (id: number) => {
        try {
            await notificationService.deleteNotification(id);
            setAllNotifications(prev => prev.filter(n => n.id !== id));
            useNotificationStore.getState().removeNotification(id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }
    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setAllNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {allCombined.map((n) => (
                <li key={n.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition ${!n.isRead ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
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
                            className='text-red-500 hover:text-red-700'
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
