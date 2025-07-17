'use client';

import { useEffect, useState } from 'react';
import { useCallStore } from '@/stores/useCallStore';
import { userService } from '@/services/userService';

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 dark:bg-black/80">
      <div className="bg-white dark:bg-dark-card rounded-3xl p-6 w-[340px] text-center shadow-2xl border dark:border-dark-border relative space-y-4">

        <div className="absolute top-[-28px] left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.5-2.5v9l-4.5-2.5M4 6h1a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          📞 Cuộc gọi đến
        </h2>

        {callerInfo ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img
                src={callerInfo.avatar_url}
                alt={`${callerInfo.first_name} ${callerInfo.last_name}`}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500 animate-bounce-slow"
              />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {callerInfo.first_name} {callerInfo.last_name}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Đang tải thông tin người gọi...</p>
        )}

        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          {incomingCall.callType === 'audio' ? 'Cuộc gọi âm thanh' : 'Cuộc gọi video'}
        </p>

        <div className="flex justify-center gap-4 pt-3">
          <button
            onClick={handleAccept}
            className="bg-green-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Chấp nhận
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-red-600 transition-colors"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};
