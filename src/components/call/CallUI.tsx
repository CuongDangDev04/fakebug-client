'use client';

import { useCallStore } from '@/stores/useCallStore';
import { CallUIInner } from './CallUIInner';

interface Props {
  socket: any;
  currentUserId: number;
}

export const CallUI = ({ socket, currentUserId }: Props) => {
  const { isCalling, role,peerUserId ,isCallStarted} = useCallStore();
  const targetId = Number(peerUserId);
  // ⛔ Không render gì nếu chưa vào cuộc gọi hoặc role chưa rõ ràng
  console.log('🔍 [CallUI] Render:', {
    isCalling,
    role,
    isCallStarted,
    peerUserId,
    
  });
if (!isCalling || !role || !isCallStarted) {
  return null;
}

  // ✅ Render nội dung khi role đã sẵn sàng
  return (
    <CallUIInner
      socket={socket}
      currentUserId={currentUserId}
      role={role}
       targetUserId={targetId} 
    />
  );
};
