import type Notification from "@/types/notification";
import { create } from "zustand";

type NotificationState = {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    removeNotification: (id: number) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
}));
