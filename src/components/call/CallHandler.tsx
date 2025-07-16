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



    socket.on('incoming-call', onIncomingCall);
    socket.on('call-started', onCallStarted);
    socket.on('receiver-accepted', onReceiverAccepted);
    socket.on('call-ended', onCallEnded);

    return () => {
      socket.off('incoming-call', onIncomingCall);
      socket.off('call-started', onCallStarted);
      socket.off('receiver-accepted', onReceiverAccepted);
      socket.off('call-ended', onCallEnded);
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-xl shadow-xl text-center space-y-2">
            <p className="text-gray-800 font-medium">{rejectedMessage}</p>
            <button
              onClick={() => setRejectedMessage(null)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

    </>
  );
};
