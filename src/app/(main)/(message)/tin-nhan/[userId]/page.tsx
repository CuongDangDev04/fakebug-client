"use client";
import ChatBox from "@/components/messages/ChatBox";
import ChatSidebar from "@/components/messages/ChatSidebar";
import { useUserStore } from "@/stores/userStore";
import { use } from "react";
import { useState } from "react";
import { useCallStore } from "@/stores/useCallStore";

interface ChatPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function ChatPage(props: ChatPageProps) {
  const { userId } = use(props.params);
  const currentuserId = useUserStore((state) => state.user?.id);
  const currentUserId = Number(currentuserId);
  const targetUserId = parseInt(userId);

  const [chattingUserId, setChattingUserId] = useState<number | null>(null);

  if (!currentUserId) {
    return null
  }

  return (
    <div className="flex h-full md:h-[90vh] relative">

      {/* Sidebar desktop */}
      <div className="hidden md:block w-80 border-r h-full">
        <ChatSidebar
          onSelectUser={(userId) => setChattingUserId(userId)}
        />
      </div>

      {/* Sidebar mobile */}
      {chattingUserId === null && (
        <div className={`md:hidden fixed inset-0  `}>
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
          />
          <ChatSidebar
            mobileOpen={true}
            onSelectUser={(userId) => {
              setChattingUserId(userId);
            }}
          />
        </div>
      )}

      {/* ChatBox */}
      {(chattingUserId !== null || targetUserId) && (
        <div className={`flex-1 h-full md:h-[90vh] min-w-0 ${chattingUserId === null && 'hidden md:block'}`}>
          <ChatBox
            currentUserId={currentUserId}
            targetUserId={chattingUserId || targetUserId}
            onStartCall={(type) => {
              const socket = (window as any).callSocket;
              const callId = Date.now();
              socket?.emit('start-call', {
                callerId: currentUserId,
                receiverId: chattingUserId || targetUserId,
                callType: type,
                callId,
              });
              useCallStore.getState().startCalling(callId, type, chattingUserId || targetUserId);
              console.log('[FE] 📞 Người gọi phát lệnh. Bắt đầu cuộc gọi với role=caller, callId=', callId);
            }}
            onBack={() => {
              setChattingUserId(null); // Quay lại Sidebar trên mobile
            }}
          />
        </div>
      )}

    </div>
  );
}
