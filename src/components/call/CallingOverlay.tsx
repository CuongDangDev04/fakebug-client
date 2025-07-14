'use client';

import { useCallStore } from '@/stores/useCallStore';

interface Props {
  receiverId: number;
  onCancel: () => void;
}

export const CallingOverlay = ({ receiverId, onCancel }: Props) => {
  const { callType } = useCallStore();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-[320px] space-y-4">
        <h2 className="text-xl font-semibold">🔔 Đang gọi...</h2>
        <p className="text-gray-600">Gọi người dùng #{receiverId} ({callType})</p>
        <button
          onClick={onCancel}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
        >
          Huỷ cuộc gọi
        </button>
      </div>
    </div>
  );
};
