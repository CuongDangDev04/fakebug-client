import { create } from 'zustand';

export type CallType = 'audio' | 'video';
export type CallRole = 'caller' | 'receiver';

interface IncomingCallData {
  callId: number;
  callerId: number;
  callType: CallType;
}

interface CallStore {
  incomingCall: IncomingCallData | null;
  isCalling: boolean;
  activeCallId: number | null;
  callType: CallType | null;
  peerConnected: boolean;
  peerUserId: number | null;
  role: CallRole | null;
  isCallStarted: boolean;
  startCallSession: () => void;
  resetCallSession: () => void;  // ✅ NEW
  openIncomingCall: (call: IncomingCallData) => void;
  closeIncomingCall: () => void;
  startCalling: (callId: number, type: CallType, targetUserId: number) => void;
  acceptCall: (callId: number, type: CallType, targetUserId: number) => void;
  endCall: () => void;
  rejectedMessage: string | null;
  setPeerConnected: (value: boolean) => void;
  setPeerUserId: (id: number) => void;
  setRole: (role: CallRole) => void;
  setActiveCallId: (id: number) => void;
  setRejectedMessage: (message: string | null) => void;
}

export const useCallStore = create<CallStore>((set) => ({
  incomingCall: null,
  isCalling: false,
  activeCallId: null,
  callType: null,
  peerConnected: false,
  peerUserId: null,
  role: null,
  isCallStarted: false,

  openIncomingCall: (call) => set({ incomingCall: call }),
  closeIncomingCall: () => set({ incomingCall: null }),

  startCalling: (callId, type, targetUserId) =>
    set({
      isCalling: true,
      activeCallId: callId,
      callType: type,
      incomingCall: null,
      role: 'caller',
      peerUserId: targetUserId,
      isCallStarted: false,
    }),

  acceptCall: (callId, type, targetUserId) =>
    set({
      isCalling: true,
      activeCallId: callId,
      callType: type,
      incomingCall: null,
      role: 'receiver',
      peerUserId: targetUserId,
      isCallStarted: false,
    }),

  startCallSession: () => set({ isCallStarted: true }),

  resetCallSession: () => set({ isCallStarted: false }),  // ✅ NEW

  endCall: () =>
    set({
      incomingCall: null,
      isCalling: false,
      activeCallId: null,
      callType: null,
      peerConnected: false,
      peerUserId: null,
      role: null,
      isCallStarted: false,
    }),

  setPeerConnected: (value) => set({ peerConnected: value }),
  setPeerUserId: (id) => set({ peerUserId: id }),
  setRole: (role) => set({ role }),
  setActiveCallId: (id) => set({ activeCallId: id }),
  rejectedMessage: null,
  setRejectedMessage: (message) => set({ rejectedMessage: message }),

}));
