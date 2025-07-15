'use client';

import { useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { EndCallButton } from './EndCallButton';
import { useCallStore } from '@/stores/useCallStore';

interface Props {
  socket: any;
  currentUserId: number;
  role: 'caller' | 'receiver';
  targetUserId: number;
}

export const CallUIInner = ({ socket, currentUserId, role, targetUserId }: Props) => {
  const { localVideoRef, remoteVideoRef, cleanup } = useWebRTC(socket, currentUserId, role, targetUserId);
  const { endCall } = useCallStore()
  useEffect(() => {
    if (!socket) return;

    const handleCallEnded = () => {
      console.log('[CallUIInner] 🔴 Đóng cuộc gọi do nhận sự kiện call-ended');
      endCall()
      cleanup();
    };

    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, cleanup]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-[70%] h-[60%] bg-gray-900 rounded-xl mb-4"
      />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-[30%] h-[20%] bg-gray-700 rounded-xl absolute bottom-6 right-6 border-4 border-white"
      />
      <EndCallButton socket={socket} cleanup={cleanup} currentUserId={currentUserId}
        peerUserId={targetUserId} />
    </div>
  );
};
