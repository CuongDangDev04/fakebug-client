import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { EndCallButton } from './EndCallButton';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useEffect, useState } from 'react';
import { useCallStore } from '@/stores/useCallStore';

interface Props {
  socket: any;
  currentUserId: number;
  role: 'caller' | 'receiver';
  targetUserId: number;
  callType: 'audio' | 'video'
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export const CallUIInner = ({ socket, currentUserId, role, targetUserId, callType }: Props) => {
  const { endCall } = useCallStore();

  const {
    localVideoRef,
    remoteVideoRef,
    cleanup,
    toggleMic,
    toggleCam,
    isMicEnabled,
    isCamEnabled
  } = useWebRTC(socket, currentUserId, role, targetUserId, callType);


  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCallEnded = () => {
      console.log('[CallUIInner] 🔴 Đóng cuộc gọi do nhận sự kiện call-ended');
      endCall();
      cleanup();
    };

    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket, cleanup]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center ">
      {/* Remote video (toàn màn hình) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover bg-black"
      />

      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Local video (góc dưới) */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute bottom-4 right-4 w-24 h-40 sm:w-32 sm:h-48 bg-black rounded-xl border-2 border-white object-cover shadow-lg"
      />

      {/* Thời gian cuộc gọi */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-sm sm:text-base bg-black/60 px-4 py-1 rounded-full">
        {formatTime(callDuration)}
      </div>

      {/* Điều khiển */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 sm:space-x-6">
        <button
          onClick={toggleMic}
          className="bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-full transition backdrop-blur"
        >
          {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {callType === 'video' && (
          <button
            onClick={toggleCam}
            className="bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-full transition backdrop-blur"
          >
            {isCamEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        )}

        <EndCallButton
          socket={socket}
          cleanup={cleanup}
          currentUserId={currentUserId}
          peerUserId={targetUserId}
        />
      </div>
    </div>

  );
};
