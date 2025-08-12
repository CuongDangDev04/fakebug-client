'use client';

import { useRouter } from 'next/navigation';
import ChatBox from '@/components/messages/ChatBox';
import { useUserStore } from '@/stores/userStore';
import { useCallStore } from '@/stores/useCallStore';
import { use } from 'react';
import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';

interface ChatPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function ChatPage(props: ChatPageProps) {
  const { userId } = use(props.params);
  const router = useRouter();

  const currentuserId = useUserStore((state) => state.user?.id);
  const currentUserId = Number(currentuserId);
  const targetUserId = parseInt(userId);

  const [chattingUserId, setChattingUserId] = useState<number | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    async function checkUserExists() {
      try {
        const data = await userService.getPublicUserInfo(targetUserId);
        if (data === null) {
          // User không tồn tại, chuyển hướng 404
          router.push('/not-found');
          return;
        }
        setChattingUserId(targetUserId);
      } catch (error) {
        console.error(error);
        router.push('/not-found');
      } finally {
        setCheckingUser(false);
      }
    }
    checkUserExists();
  }, [targetUserId, router]);


  if (!currentUserId) return null;
  if (checkingUser) return <div>Đang tải...</div>;

  return (
    <div className="w-full h-full md:h-screen">
      
      {chattingUserId && (
        <ChatBox
          currentUserId={currentUserId}
          targetUserId={chattingUserId}
          onStartCall={(type) => {
            const socket = (window as any).callSocket;
            const callId = Date.now();
            socket?.emit('start-call', {
              callerId: currentUserId,
              receiverId: chattingUserId,
              callType: type,
              callId,
            });
            useCallStore.getState().startCalling(callId, type, chattingUserId);
          }}
          onBack={() => {
            setChattingUserId(null);
          }}
        />
      )}
      
    </div>
  );
}
