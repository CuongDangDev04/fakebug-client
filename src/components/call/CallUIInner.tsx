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

export const CallUIInner = ({ socket, currentUserId, role, targetUserId ,callType}: Props) => {
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover bg-black"
      />

      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute bottom-6 right-6 w-60 h-30 bg-black rounded-xl border-2 border-white object-cover shadow-lg"
      />

      {/* Call Duration Timer */}
      <div className="absolute top-6 text-white text-lg bg-black bg-opacity-50 px-4 py-1 rounded-full">
        {formatTime(callDuration)}
      </div>

      <div className="absolute bottom-8 flex space-x-4">
        <button
          onClick={toggleMic}
          className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full shadow transition"
        >
          {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={toggleCam}
          className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full shadow transition"
        >
          {isCamEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

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
