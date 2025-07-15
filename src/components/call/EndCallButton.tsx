import { useCallStore } from '@/stores/useCallStore';
import { PhoneOff } from 'lucide-react';

export const EndCallButton = ({
  socket,
  cleanup,
  currentUserId,   // thêm props truyền từ trên xuống
  peerUserId,      // thêm props truyền từ trên xuống
}: {
  socket: any;
  cleanup: () => void;
  currentUserId: number;
  peerUserId: number;
}) => {
  const { activeCallId, endCall } = useCallStore();

  const handleEndCall = () => {
    if (activeCallId) {
      socket?.emit('end-call', {
        callId: activeCallId,
        status: 'ended',
        callerId: currentUserId,
        receiverId: peerUserId,
      });
    }

    endCall();
    cleanup();
  };

  return (
    <button
      onClick={handleEndCall}
      className=" p-4 rounded-full shadow transition text-white bg-red-600  hover:bg-red-700"
    >
       <PhoneOff size={24} />
    </button>
  );
};
