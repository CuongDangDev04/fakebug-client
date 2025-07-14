// src/components/call/EndCallButton.tsx
'use client';

import { useCallStore } from '@/stores/useCallStore';

export const EndCallButton = ({ socket }: { socket: any }) => {
  const { activeCallId, endCall } = useCallStore();

  const handleEndCall = () => {
    if (activeCallId) {
      socket?.emit('end-call', {
        callId: activeCallId,
        status: 'ended',
      });
    }
    endCall();
  };

  return (
    <button
      onClick={handleEndCall}
      className="mt-6 px-6 py-3 text-white bg-red-600 rounded-full hover:bg-red-700"
    >
      Kết thúc cuộc gọi
    </button>
  );
};
