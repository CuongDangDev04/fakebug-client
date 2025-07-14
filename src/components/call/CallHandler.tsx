'use client';

import { useEffect } from 'react';
import { useCallStore } from '@/stores/useCallStore';
import { useCallSocket } from '@/hooks/useCallSocket';
import { IncomingCallModal } from './IncomingCallModal';
import { CallingOverlay } from './CallingOverlay';
import { CallUI } from './CallUI';

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

    const onCallEnded = () => {
      console.log('❌ [CallHandler] Cuộc gọi đã kết thúc');
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
    socket?.emit('end-call', { callId: activeCallId, status: 'rejected' });
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
    </>
  );
};
