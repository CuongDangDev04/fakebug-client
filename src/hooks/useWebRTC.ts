'use client';

import { useEffect, useRef, useState } from 'react';
import { useCallStore } from '@/stores/useCallStore';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: process.env.NEXT_PUBLIC_STUN_URL!,
    },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL_1!,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME_1!,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL_1!,
    },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL_2!,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME_2!,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL_2!,
    },
  ],
};


type OfferPayload = {
  offer: RTCSessionDescriptionInit;
  callId: number;
  from: number;
};

type AnswerPayload = {
  answer: RTCSessionDescriptionInit;
};

type IceCandidatePayload = {
  candidate: RTCIceCandidateInit;
};

export const useWebRTC = (
  socket: any,
  currentUserId: number,
  role: 'caller' | 'receiver',
  targetUserId: number,
  currentCallType: 'audio' | 'video'
) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const iceQueue = useRef<IceCandidatePayload['candidate'][]>([]);
  const startedRef = useRef(false);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(true);

  const { activeCallId, callType, setPeerConnected, isCallStarted } = useCallStore();

  const createPeerConnection = () => {
    if (peerRef.current) return;
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('ice-candidate', {
          callId: activeCallId,
          candidate: event.candidate,
          targetUserId,
        });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setPeerConnected(true);
    };
  };

  const getLocalStream = async () => {
    if (localStream.current) return;

    const isVideoCall = currentCallType === 'video';   // Dùng props truyền vào, không dùng store

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    if (!isVideoCall) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
    }

    setIsCamEnabled(isVideoCall);

    console.log(`[WebRTC] Local stream attached - Video enabled: ${isVideoCall}`);
  };


  const attachTracks = () => {
    if (!localStream.current || !peerRef.current) return;

    const existingSenders = peerRef.current.getSenders();
    const existingTracks = existingSenders.map(sender => sender.track);

    localStream.current.getTracks().forEach(track => {
      if (!existingTracks.includes(track)) {
        peerRef.current?.addTrack(track, localStream.current!);
      }
    });
  };

  const startCallerFlow = async () => {
    await getLocalStream();
    createPeerConnection();
    attachTracks();

    const offer = await peerRef.current!.createOffer();
    await peerRef.current!.setLocalDescription(offer);

    socket?.emit('offer', {
      callId: activeCallId,
      offer,
      targetUserId,
    });
  };

  const toggleMic = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMicEnabled(prev => !prev);
  };

  const toggleCam = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsCamEnabled(prev => !prev);
  };

  useEffect(() => {
    if (!isCallStarted || startedRef.current) return;

    if (role === 'caller') {
      startCallerFlow();
    } else {
      (async () => {
        await getLocalStream();
        createPeerConnection();
        attachTracks();
      })();
    }

    startedRef.current = true;
  }, [isCallStarted, role, activeCallId]);

  useEffect(() => {
    if (!isCallStarted) {
      peerRef.current?.close();
      peerRef.current = null;
      localStream.current?.getTracks().forEach(t => t.stop());
      localStream.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      startedRef.current = false;
    }
  }, [isCallStarted]);

  useEffect(() => {
    if (!socket) return;

    socket.on('offer', async ({ offer, callId, from }: OfferPayload) => {
      if (callId !== activeCallId) return;

      await getLocalStream();
      createPeerConnection();
      attachTracks();
      await peerRef.current!.setRemoteDescription(new RTCSessionDescription(offer));

      for (const candidate of iceQueue.current) {
        await peerRef.current!.addIceCandidate(new RTCIceCandidate(candidate));
      }
      iceQueue.current = [];

      const answer = await peerRef.current!.createAnswer();
      await peerRef.current!.setLocalDescription(answer);

      socket.emit('answer', { answer, targetUserId: from });
    });

    socket.on('answer', async ({ answer }: AnswerPayload) => {
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }: IceCandidatePayload) => {
      if (!peerRef.current) return;
      if (!peerRef.current.remoteDescription) {
        iceQueue.current.push(candidate);
      } else {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, activeCallId]);

  const cleanup = () => {
    peerRef.current?.close();
    peerRef.current = null;

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    startedRef.current = false;
  };

  return {
    localVideoRef,
    remoteVideoRef,
    cleanup,
    toggleMic,
    toggleCam,
    isMicEnabled,
    isCamEnabled,
  };
};
