import type Notification from "@/types/notification";
import { create } from "zustand";

type NotificationState = {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  setUnreadNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  setUnreadNotifications: (unread) =>
    set((state) => ({
      notifications: [...unread, ...state.notifications.filter((n) => n.isRead)],
    })),

  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  clearNotifications: () => set({ notifications: [] }),

  getUnreadCount: () =>
    get().notifications.filter((n) => !n.isRead).length,
}));
