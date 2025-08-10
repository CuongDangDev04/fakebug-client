'use client'

import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus'
import { FriendsMessage } from '@/types/message'
import { messageService } from '@/services/messageService'
import { useFriendMessagesStore } from '@/stores/friendMessagesStore'
import React, { useEffect, useRef, useState } from 'react'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

import {
  MoreVertical,
  Phone,
  Video,
  Trash2,
  Bell,
  BellOff,
  User,
  Ban,
  Archive,
  Flag
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ConversationItemProps {
  fm: FriendsMessage
  onClick?: () => void
  onDeleteConversation?: () => void
}

function ConversationItem({ fm, onClick, onDeleteConversation }: ConversationItemProps) {
  const { isOnline } = useUserOnlineStatus(fm.friendId)
  const unreadCount = typeof fm.unreadCount === 'number' ? fm.unreadCount : 0
  const isUnread = unreadCount > 0

  const sentAtFormatted =
    fm.sent_at && !isNaN(new Date(fm.sent_at).getTime())
      ? formatRelativeTime(fm.sent_at)
      : ''

  const { setFriends } = useFriendMessagesStore()
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const handleClick = async (e: React.MouseEvent) => {
    if (isUnread && !loading) {
      setLoading(true)
      await messageService.markAsRead(fm.friendId)
      const res = await messageService.getFriendMessages()
      if (res?.friends) setFriends(res.friends)
      setLoading(false)
    }
    onClick?.()
  }

  // Đóng menu nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const handleBlockUser = async (userId: number, userName: string) => {
    try {
      await messageService.blockUser(userId);
      toast.success(`Đã chặn ${userName}`);
      setMenuOpen(false);

      // Tuỳ chọn: gọi lại danh sách bạn bè
      const res = await messageService.getFriendMessages();
      setFriends(res.friends);
    } catch (error) {
      toast.error('Không thể chặn người dùng.');
      console.error(error);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-dark-hover transition cursor-pointer group
        ${isUnread ? 'font-semibold bg-blue-50 dark:bg-dark-hover' : ''}`}
      style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}
    >
      {/* Avatar */}
      <div className="relative">
        {fm.avatar_url ? (
          <img
            src={fm.avatar_url}
            alt={fm.friendName}
            className="w-12 h-12 rounded-full object-cover border"
          />
        ) : (
          <div className="w-12 h-12 rounded-full object-cover border bg-gray-300 dark:bg-dark-border flex items-center justify-center text-sm text-white">
            {fm.friendName?.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full" />
        )}
      </div>

      {/* Tên + nội dung */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-base truncate ${isUnread
            ? 'font-semibold text-black dark:text-white'
            : 'font-medium text-gray-900 dark:text-dark-text-primary'
            }`}
        >
          {fm.friendName}
        </div>
        <div
          className={`text-xs truncate ${isUnread
            ? 'font-semibold text-black dark:text-white'
            : 'text-gray-500 dark:text-dark-text-secondary'
            }`}
        >
          {fm.content}
        </div>
      </div>

      {/* Thời gian + badge + menu ba chấm */}
      <div className="flex flex-col items-end min-w-[48px] ml-2 relative" ref={menuRef}>
        <div className="text-xs text-gray-400 dark:text-dark-text-secondary whitespace-nowrap mb-1">
          {sentAtFormatted}
        </div>
        <span
          className={`bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center transition-all duration-200
            ${unreadCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
          style={{ lineHeight: '18px' }}
        >
          {unreadCount > 0 ? unreadCount : ''}
        </span>

        {/* Nút ba chấm */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault();
            setMenuOpen((prev) => !prev)

          }}
          className="p-1 absolute rounded hidden group-hover:block  top-0 right-0"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-6 z-50 w-56 bg-white dark:bg-neutral-900 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700">
            <ul className="text-sm text-gray-700 dark:text-gray-200">

              <li
                onClick={(e) => {
                  e.preventDefault();    // Chặn hành vi mặc định
                  e.stopPropagation();   // Dừng sự kiện lan truyền
                  router.push(`/trang-ca-nhan/${fm.friendId}`);
                  setMenuOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2"
              >
                <User size={16} /> Xem trang cá nhân
              </li>

              <li
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlockUser(fm.friendId, fm.friendName);
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <Ban size={16} /> Chặn tin nhắn
              </li>


              <li
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteConversation?.()
                  setMenuOpen(false)
                }}
                className="px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 cursor-pointer flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <Trash2 size={16} /> Xoá đoạn chat
              </li>

            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
function areEqual(prev: ConversationItemProps, next: ConversationItemProps) {
  return (
    prev.fm.id === next.fm.id &&
    prev.fm.unreadCount === next.fm.unreadCount &&
    prev.fm.content === next.fm.content &&
    prev.fm.sent_at === next.fm.sent_at &&
    prev.fm.is_revoked === next.fm.is_revoked &&
    prev.fm.friendName === next.fm.friendName &&
    prev.fm.avatar_url === next.fm.avatar_url
  );
}

export default React.memo(ConversationItem, areEqual);
