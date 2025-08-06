"use client";

import ChatBox from "@/components/messages/ChatBox";
import { useUserStore } from "@/stores/userStore";
import { useCallStore } from "@/stores/useCallStore";
import { use } from "react";
import { useState, useEffect } from "react";

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
  
  useEffect(() => {
    setChattingUserId(targetUserId);
  }, [targetUserId]);

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="w-full h-full md:h-screen">
      {chattingUserId && (
        <ChatBox
          currentUserId={currentUserId}
          targetUserId={chattingUserId}
          onStartCall={(type) => {
            const socket = (window as any).callSocket;
            const callId = Date.now();
            socket?.emit("start-call", {
              callerId: currentUserId,
              receiverId: chattingUserId,
              callType: type,
              callId,
            });
            useCallStore
              .getState()
              .startCalling(callId, type, chattingUserId);
            console.log(
              "[FE] 📞 Người gọi phát lệnh. Bắt đầu cuộc gọi với role=caller, callId=",
              callId
            );
          }}
          onBack={() => {
            // Quay lại Sidebar trên mobile
            setChattingUserId(null);
          }}
        />
      )}
    </div>
  );
}
