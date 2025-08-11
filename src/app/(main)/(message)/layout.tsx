'use client'

import { useState, useEffect } from "react"
import ChatSidebar from "@/components/messages/ChatSidebar"
import ChatBox from "@/components/messages/ChatBox"
import { usePathname } from "next/navigation"
import { useUserStore } from "@/stores/userStore"
import { useCallStore } from "@/stores/useCallStore"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Lấy userId từ URL, ví dụ: /tin-nhan/123
  const match = pathname?.match(/\/tin-nhan\/(\d+)/)
  const targetUserId = match ? parseInt(match[1]) : null

  const currentuserId = useUserStore((state) => state.user?.id)
  const currentUserId = Number(currentuserId)

  const [chattingUserId, setChattingUserId] = useState<number | null>(null)

  // Tự động set user đang chat khi vào đường dẫn cụ thể
  useEffect(() => {
    if (targetUserId) {
      setChattingUserId(targetUserId)
    }
  }, [targetUserId])

  if (!currentUserId) return null

  return (
    <div className="flex  relative">
      {/* Sidebar desktop */}
      <div className="hidden md:block w-80 border-r h-full">
        <ChatSidebar
          onSelectUser={(userId) => setChattingUserId(userId)}
        />
      </div>

      {/* Sidebar mobile */}
      {chattingUserId === null && (
        <div className="md:hidden fixed top-[64px] left-0 right-0 bottom-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <ChatSidebar
            mobileOpen={true}
            onSelectUser={(userId) => setChattingUserId(userId)}
          />
        </div>
      )}

      {/* Nếu không có người đang chat, hiển thị nội dung page.tsx */}
      {chattingUserId === null && targetUserId === null && (
        <div className="flex-1 h-full md:h-[90vh] flex items-center justify-center">
          {children}
        </div>
      )}

      {/* ChatBox */}
      {(chattingUserId !== null || targetUserId !== null) && (
        <div className={`flex-1 h-full md:h-[90vh] min-w-0 ${chattingUserId === null && 'hidden md:block'}`}>
          <ChatBox
            key={chattingUserId || targetUserId}
            currentUserId={currentUserId}
            targetUserId={chattingUserId || targetUserId!}
            onStartCall={(type) => {
              const socket = (window as any).callSocket
              const callId = Date.now()
              socket?.emit('start-call', {
                callerId: currentUserId,
                receiverId: chattingUserId || targetUserId,
                callType: type,
                callId,
              })
              useCallStore.getState().startCalling(callId, type, chattingUserId || targetUserId!)
              console.log('[FE] 📞 Người gọi phát lệnh. Bắt đầu cuộc gọi với role=caller, callId=', callId)
            }}
            onBack={() => {
              setChattingUserId(null) // Quay lại Sidebar trên mobile
            }}
          />
        </div>
      )}
    </div>
  )

}
