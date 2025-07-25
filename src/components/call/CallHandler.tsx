'use client';

import { useEffect } from 'react';
import { useCallStore } from '@/stores/useCallStore';
import { useCallSocket } from '@/hooks/useCallSocket';
import { IncomingCallModal } from './IncomingCallModal';
import { CallingOverlay } from './CallingOverlay';
import { CallUI } from './CallUI';
import { useWebRTC } from '@/hooks/useWebRTC';

interface Props {
  currentUserId: number;
}

export const CallHandler = ({ currentUserId }: Props) => {
  const socketRef = useCallSocket(currentUserId);
  const socket = socketRef.current;
  const {
    openIncomingCall,
    isCalling,
    activeCallId,
    endCall,
    incomingCall,
    startCalling,
    acceptCall,
    startCallSession,
    peerUserId,
    isCallStarted,
    setActiveCallId,
    rejectedMessage,
    setRejectedMessage,
  } = useCallStore();


  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onIncomingCall = (data: any) => {
      console.log('[FE] 📞 Cuộc gọi đến:', data);
      openIncomingCall(data);
    };

    const onCallStarted = (data: any) => {
      console.log('🚀 [Receiver] Cuộc gọi chính thức bắt đầu:', data);

      // ✅ Cả caller và receiver đều nhận được callId chuẩn từ server
      setActiveCallId(data.callId);

      if (currentUserId === data.receiverId) {
        acceptCall(data.callId, data.callType, data.callerId);
        startCallSession();
      }
    };

    const onReceiverAccepted = (data: any) => {
      console.log('📢 [Caller] Receiver đã chấp nhận cuộc gọi:', data);

      setActiveCallId(data.callId);

      if (currentUserId === data.callerId) {
        startCallSession();
      }
    };

    const onCallEnded = (data: any) => {
      console.log('❌ [CallHandler] Cuộc gọi đã kết thúc:', data);

      const isCaller = currentUserId === data.callerId;
      const isReceiver = currentUserId === data.receiverId;

      if (data.status === 'rejected') {
        if (isCaller) {
          setRejectedMessage('📵 Người nhận đã từ chối cuộc gọi.');
        } else if (isReceiver) {
          setRejectedMessage('❌ Bạn đã từ chối cuộc gọi.');
        }
      } else if (data.status === 'cancelled') {
        if (isReceiver) {
          setRejectedMessage('📵 Người gọi đã huỷ cuộc gọi.');
        } else if (isCaller) {
          setRejectedMessage('❌ Bạn đã huỷ cuộc gọi'); // Người gọi tự huỷ không hiển thị gì
        }
      }

      endCall();
    };
    const onUserNotOnline = (data: any) => {
      console.log('❌ [Caller] Người nhận không online:', data);
      if (data.callerId === currentUserId) {
        setRejectedMessage('📴 Người nhận hiện không trực tuyến.');
        endCall();
      }
    };




    socket.on('user-not-online', onUserNotOnline);
    socket.on('incoming-call', onIncomingCall);
    socket.on('call-started', onCallStarted);
    socket.on('receiver-accepted', onReceiverAccepted);
    socket.on('call-ended', onCallEnded);

    return () => {
      socket.off('incoming-call', onIncomingCall);
      socket.off('call-started', onCallStarted);
      socket.off('receiver-accepted', onReceiverAccepted);
      socket.off('call-ended', onCallEnded);
      socket.off('user-not-online', onUserNotOnline);

    };
  }, [socketRef.current]);

  const cancelCall = () => {
    if (!activeCallId) return;
    socket?.emit('end-call', {
      callId: activeCallId,
      status: 'cancelled',  // ✅ khác 'rejected'
      callerId: currentUserId,
      receiverId: peerUserId
    });
    endCall();
  };


  return (
    <>
      {isCalling && !incomingCall && !isCallStarted && (
        <CallingOverlay
          receiverId={peerUserId ?? currentUserId}
          onCancel={cancelCall}
        />
      )}

      {incomingCall && (
        <IncomingCallModal socket={socket} currentUserId={currentUserId} />
      )}

      {isCallStarted && (
        <CallUI socket={socket} currentUserId={currentUserId} />
      )}
      {rejectedMessage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 dark:bg-black/80 animate-fade-in">
          <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-xl w-[340px] text-center py-6 px-5 relative">

            {/* Icon cảnh báo lớn */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-500 p-4 rounded-full shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 5c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7z" />
                </svg>
              </div>
            </div>

            {/* Nội dung thông báo */}
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Cuộc gọi không thành công
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {rejectedMessage}
            </p>

            {/* Nút đóng kiểu hiện đại */}
            <button
              onClick={() => setRejectedMessage(null)}
              className="mt-6 bg-red-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-transform active:scale-95"
            >
              Đã hiểu
            </button>

          </div>
        </div>
      )}


    </>
  );
};
