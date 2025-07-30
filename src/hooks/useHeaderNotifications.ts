// hooks/useHeaderNotifications.ts
import { useEffect, useState } from 'react'
import { useNotificationStore } from '@/stores/notificationStore'
import { notificationService } from '@/services/notificationService'
import { messageService } from '@/services/messageService'

export function useHeaderNotifications() {
  // State để lưu tổng số tin nhắn chưa đọc
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0)

  // Lấy các hàm từ notificationStore
  const {
    markAllAsRead: markAllAsReadFromStore,
    getUnreadCount,      
    setUnreadNotifications,      // Cập nhật danh sách thông báo chưa đọc
  } = useNotificationStore()

  // Lấy danh sách thông báo chưa đọc từ server khi component được mount
  useEffect(() => {
    const fetchUnreadNoti = async () => {
      try {
        const res = await notificationService.getUnreadNotification()
        if (res?.noti) {
          setUnreadNotifications(res.noti) // Cập nhật thông báo chưa đọc vào store
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông báo chưa đọc:', error)
      }
    }
    fetchUnreadNoti()
  }, [setUnreadNotifications])

  // Lấy số lượng tin nhắn chưa đọc và thiết lập socket để cập nhật real-time
  useEffect(() => {
    let isMounted = true

    const fetchTotalUnread = async () => {
      try {
        const res = await messageService.getTotalUnreadCount()
        if (isMounted) setTotalUnreadMessages(res?.totalUnreadCount ?? 0)
      } catch (err) {
        console.error('Lỗi khi lấy số tin nhắn chưa đọc:', err)
      }
    }

    fetchTotalUnread()

    let socket: any

    // Hàm chờ socket sẵn sàng, sau đó lắng nghe sự kiện
    const waitForSocket = () => {
      socket = (window as any).chatSocket
      if (!socket) {
        setTimeout(waitForSocket, 300) // Nếu socket chưa sẵn sàng thì tiếp tục chờ
        return
      }

      const updateUnread = async () => {
        const res = await messageService.getTotalUnreadCount()
        if (isMounted) setTotalUnreadMessages(res?.totalUnreadCount ?? 0)
      }

      // Lắng nghe sự kiện có tin nhắn mới hoặc tin nhắn đã được đọc
      socket.on('newMessage', updateUnread)
      socket.on('message-read', updateUnread)

      // Trả về hàm cleanup để huỷ lắng nghe khi component unmount
      return () => {
        socket.off('newMessage', updateUnread)
        socket.off('message-read', updateUnread)
      }
    }

    const cleanup = waitForSocket()

    // Cleanup khi component unmount
    return () => {
      isMounted = false
      if (typeof cleanup === 'function') cleanup()
    }
  }, [])

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      markAllAsReadFromStore()  // Xóa toàn bộ thông báo trong store
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc tất cả:', error)
    }
  }

  // Trả về các giá trị để dùng ở component
  return {
    totalUnreadMessages, // Tổng số tin nhắn chưa đọc
    unreadNotificationCount: getUnreadCount(), // Số lượng thông báo chưa đọc
    markAllAsRead, // Hàm đánh dấu tất cả thông báo là đã đọc
  }
}
