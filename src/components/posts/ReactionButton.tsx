'use client'

import { useEffect, useState, useRef } from 'react'
import { ThumbsUp } from 'lucide-react'
import { postReactionsService } from '@/services/postReactionsService'
import { useUserStore } from '@/stores/userStore'
import { ReactedUser, ReactionType } from '@/types/post'
import { notificationService } from '@/services/notificationService'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const reactions = [
  { name: 'Thích', url: '/reactions/like.svg', type: 'like' },
  { name: 'Yêu thích', url: '/reactions/love.svg', type: 'love' },
  { name: 'Haha', url: '/reactions/haha.svg', type: 'haha' },
  { name: 'Wow', url: '/reactions/wow.svg', type: 'wow' },
  { name: 'Buồn', url: '/reactions/sad.svg', type: 'sad' },
  { name: 'Phẫn nộ', url: '/reactions/angry.svg', type: 'angry' },
]

const reactionColors: Record<ReactionType, string> = {
  like: 'text-blue-600 dark:text-[#4497f5]',
  love: 'text-red-500',
  haha: 'text-yellow-500',
  wow: 'text-yellow-500',
  sad: 'text-yellow-500',
  angry: 'text-orange-500',
}

export default function ReactionButton({
  postId,
  reactedUsers,
  postOwnerId,
  onReacted,
}: {
  postId: number
  reactedUsers: ReactedUser[]
  postOwnerId: number
  onReacted?: (reaction: ReactionType | null) => void
}) {
  const currentUser = useUserStore(state => state.user)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTriggered = useRef(false)

  useEffect(() => {
    if (currentUser) {
      const userReaction = reactedUsers.find(u => u.id === currentUser.id)
      setSelectedReaction(userReaction ? userReaction.type : null)
    }
  }, [currentUser, reactedUsers])

  const handleReact = async (reaction: ReactionType) => {
    if (!currentUser) return

    await postReactionsService.react(postId, currentUser.id, reaction)

    if (currentUser.id !== postOwnerId) {
      await notificationService.sendNotification(
        postOwnerId,
        `${currentUser.first_name} ${currentUser.last_name} đã ${reactionName(reaction)} bài viết của bạn.`,
        `/bai-viet/${postId}`,
        currentUser.avatar_url || ''
      )
    }

    setSelectedReaction(reaction)
    setShowReactions(false)
    onReacted?.(reaction)
  }

  const handleRemoveReaction = async () => {
    if (!currentUser) return

    await postReactionsService.removeReaction(postId, currentUser.id)
    setSelectedReaction(null)
    onReacted?.(null)
  }

  const handleButtonClick = async () => {
    if (selectedReaction) {
      await handleRemoveReaction()
    } else {
      await handleReact('like')
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowReactions(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowReactions(false)
    }, 200)
  }

  //  Long press trên mobile
  const handleTouchStart = () => {
    longPressTriggered.current = false
    timeoutRef.current = setTimeout(() => {
      setShowReactions(true)
      longPressTriggered.current = true
    }, 500)
  }

  const handleTouchEnd = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!longPressTriggered.current) {
      await handleButtonClick() // nếu không giữ đủ lâu → xem như tap
    }
  }

  const reactionName = (reaction: ReactionType) => {
    switch (reaction) {
      case 'like':
        return 'thích'
      case 'love':
        return 'yêu thích'
      case 'haha':
        return 'cười haha'
      case 'wow':
        return 'thể hiện sự ngạc nhiên'
      case 'sad':
        return 'cảm thấy buồn'
      case 'angry':
        return 'phẫn nộ'
      default:
        return 'phản ứng'
    }
  }

  return (
    <div
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onTouchCancel={isMobile ? handleTouchEnd : undefined}
      className="relative select-none"
    >
      <button
        onClick={!isMobile ? handleButtonClick : undefined}
        onContextMenu={e => isMobile && e.preventDefault()} 
        className={`
          flex items-center justify-center gap-1 px-4 h-9 rounded-lg  select-none
          dark:text-gray-300 
          hover:bg-gray-100 dark:hover:bg-dark-hover 
          ${selectedReaction ? reactionColors[selectedReaction] : ''}
        `}
      >
        {selectedReaction ? (
          <img
            src={reactions.find(r => r.type === selectedReaction)?.url || '/reactions/like.svg'}
            alt={selectedReaction}
            className="w-5 h-5"
          />
        ) : (
          <ThumbsUp size={18} />
        )}
        <span className="text-sm font-medium select-none">
          {selectedReaction
            ? reactions.find(r => r.type === selectedReaction)?.name
            : 'Thích'}
        </span>
      </button>

      {showReactions && (
        <div className="absolute bottom-10 left-0 bg-white dark:bg-dark-card rounded-full shadow-lg flex gap-3 px-4 py-3 z-50 min-w-[340px] justify-center">
          {reactions.map(r => (
            <button
              key={r.type}
              onClick={() => handleReact(r.type as ReactionType)}
              className="hover:scale-125 transition-transform"
            >
              <img src={r.url} alt={r.name} className="w-16 h-10" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
