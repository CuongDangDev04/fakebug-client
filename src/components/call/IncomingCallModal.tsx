'use client';

import { useEffect } from 'react';
import { useCallStore } from '@/stores/useCallStore';

interface Props {
  socket: any;
  currentUserId: number;
}

export const IncomingCallModal = ({ socket, currentUserId }: Props) => {
  const {
    incomingCall,
    closeIncomingCall,
    acceptCall,
    setPeerUserId,
  } = useCallStore();

  useEffect(() => {
    if (!incomingCall) return;

    const ring = new Audio('/sounds/ringing.mp3');
    ring.loop = true;
    ring.play().catch(() => {});

    return () => {
      ring.pause();
      ring.currentTime = 0;
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    if (incomingCall) {
      const callerId = incomingCall.callerId;

      // ✅ Lưu lại ID người gọi
      setPeerUserId(callerId);

      // ✅ Gửi accept-call về server, cần truyền đúng callerId
      socket?.emit('accept-call', {
        callId: incomingCall.callId,
        
        callerId,         
        receiverId: currentUserId,       
      });

      // ✅ Cập nhật trạng thái cuộc gọi phía client
      acceptCall(incomingCall.callId, incomingCall.callType, callerId);

      closeIncomingCall();
    }
  };

  const handleReject = () => {
    socket?.emit('end-call', {
      callId: incomingCall.callId,
      status: 'rejected',
    });
    closeIncomingCall();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-[320px] space-y-4">
        <h2 className="text-xl font-semibold">📞 Cuộc gọi đến</h2>
        <p className="text-gray-600">
          Người dùng #{incomingCall.callerId} ({incomingCall.callType})
        </p>
        <div className="flex justify-center gap-4 pt-3">
          <button
            onClick={handleAccept}
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
          >
            Chấp nhận
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};
