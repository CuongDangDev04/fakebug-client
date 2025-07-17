'use client';

import { useEffect, useState } from 'react';
import { useCallStore } from '@/stores/useCallStore';
import { userService } from '@/services/userService'; // Import service

interface Props {
  receiverId: number;
  onCancel: () => void;
}

interface UserInfo {
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export const CallingOverlay = ({ receiverId, onCancel }: Props) => {
  const { callType } = useCallStore();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await userService.getPublicUserInfo(receiverId);
        setUserInfo(data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người nhận:', error);
      }
    };

    fetchUserInfo();
  }, [receiverId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-[320px] space-y-4">
        <h2 className="text-xl font-semibold">🔔 Đang gọi...</h2>

        {userInfo ? (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={userInfo.avatar_url}
              alt={`${userInfo.first_name} ${userInfo.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
            <p className="text-lg font-medium">
              {userInfo.first_name} {userInfo.last_name}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        )}

        <p className="text-gray-600">({callType})</p>

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
