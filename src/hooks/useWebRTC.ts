'use client';

import { useEffect, useRef } from 'react';
import { useCallStore } from '@/stores/useCallStore';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const useWebRTC = (
  socket: any,
  currentUserId: number,
  role: 'caller' | 'receiver',
  targetUserId: number,
) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const iceQueue = useRef<any[]>([]);
  const startedRef = useRef(false);

  const { activeCallId, callType, setPeerConnected, isCallStarted } = useCallStore();

  const createPeerConnection = () => {
    if (peerRef.current) return;
    console.log(`[WebRTC] Creating RTCPeerConnection as ${role}`);
    const peer = new RTCPeerConnection(ICE_SERVERS);
    peerRef.current = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] ICE candidate generated:', event.candidate);
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
        console.log('[WebRTC] Remote stream attached to remoteVideoRef');
      }
      setPeerConnected(true);
    };
  };

  const getLocalStream = async () => {
    if (localStream.current) return;
    console.log('[WebRTC] Requesting local media stream...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true,
    });
    localStream.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    console.log('[WebRTC] Local stream attached');
  };

  const attachTracks = () => {
    if (!localStream.current || !peerRef.current) return;

    const existingSenders = peerRef.current.getSenders();
    const existingTracks = existingSenders.map((sender) => sender.track);

    console.log('[WebRTC] Adding local tracks to peer connection...');

    localStream.current.getTracks().forEach((track) => {
      const alreadyAdded = existingTracks.includes(track);
      if (!alreadyAdded) {
        console.log('[WebRTC] Adding track:', track.kind);
        peerRef.current?.addTrack(track, localStream.current!);
      } else {
        console.log(`[WebRTC] Track ${track.kind} already added, skipping.`);
      }
    });
  };


  const startCallerFlow = async () => {
    await getLocalStream();
    createPeerConnection();
    attachTracks();

    const offer = await peerRef.current!.createOffer();
    await peerRef.current!.setLocalDescription(offer);

    console.log('[WebRTC] Caller sending offer...');
    socket?.emit('offer', {
      callId: activeCallId,
      offer,
      targetUserId,
    });
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
      localStream.current?.getTracks().forEach((t) => t.stop());
      localStream.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      startedRef.current = false;
    }
  }, [isCallStarted]);

  useEffect(() => {
    if (!socket) return;

    socket.on('offer', async ({ offer, callId, from: callerId }) => {
      if (callId !== activeCallId) {
        console.warn('[WebRTC] Ignoring offer for wrong callId');
        return;
      }
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

      socket.emit('answer', { answer, targetUserId: callerId });
    });

    socket.on('answer', async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
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
    console.log('[WebRTC] Manual cleanup triggered...');
    peerRef.current?.close();
    peerRef.current = null;

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    startedRef.current = false;
    console.log('Đã cleanup stream')
  };
  return { localVideoRef, remoteVideoRef, cleanup };
};
