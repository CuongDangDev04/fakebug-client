'use client';

import { useEffect, useState } from 'react';
import { useCallStore } from '@/stores/useCallStore';
import { userService } from '@/services/userService'; // Import service

interface Props {
  socket: any;
  currentUserId: number;
}

interface UserInfo {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export const IncomingCallModal = ({ socket, currentUserId }: Props) => {
  const {
    incomingCall,
    closeIncomingCall,
    acceptCall,
    setPeerUserId,
  } = useCallStore();

  const [callerInfo, setCallerInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (incomingCall) {
      const fetchCallerInfo = async () => {
        try {
          const data = await userService.getPublicUserInfo(incomingCall.callerId);
          setCallerInfo(data);
        } catch (error) {
          console.error('Lỗi lấy thông tin người gọi:', error);
        }
      };

      fetchCallerInfo();
    }
  }, [incomingCall]);

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
    const callerId = incomingCall.callerId;

    setPeerUserId(callerId);

    socket?.emit('accept-call', {
      callId: incomingCall.callId,
      callType: incomingCall.callType,
      callerId,
      receiverId: currentUserId,
    });

    acceptCall(incomingCall.callId, incomingCall.callType, callerId);

    closeIncomingCall();
  };

  const handleReject = () => {
    socket?.emit('end-call', {
      callId: incomingCall.callId,
      status: 'rejected',
      callerId: incomingCall.callerId,
      receiverId: currentUserId,
    });

    closeIncomingCall();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-[320px] space-y-4">
        <h2 className="text-xl font-semibold">📞 Cuộc gọi đến</h2>

        {callerInfo ? (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={callerInfo.avatar_url}
              alt={`${callerInfo.first_name} ${callerInfo.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
            <p className="text-lg font-medium">
              {callerInfo.first_name} {callerInfo.last_name}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">Đang tải thông tin người gọi...</p>
        )}

        <p className="text-gray-600">({incomingCall.callType})</p>

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
