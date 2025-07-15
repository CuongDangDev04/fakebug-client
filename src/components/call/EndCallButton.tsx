import { useCallStore } from '@/stores/useCallStore';

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
      className="mt-6 px-6 py-3 text-white bg-red-600 rounded-full hover:bg-red-700"
    >
      Kết thúc cuộc gọi
    </button>
  );
};
