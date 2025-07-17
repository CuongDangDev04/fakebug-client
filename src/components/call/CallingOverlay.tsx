'use client';

import { useEffect, useState } from 'react';
import { useCallStore } from '@/stores/useCallStore';
import { userService } from '@/services/userService';

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 dark:bg-black/80">
      <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-2xl text-center w-[340px] space-y-4 border dark:border-dark-border relative">
        <div className="absolute top-[-28px] left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.5-2.5v9l-4.5-2.5M4 6h1a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white">🔔 Đang gọi...</h2>

        {userInfo ? (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={userInfo.avatar_url}
              alt={`${userInfo.first_name} ${userInfo.last_name}`}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-500 animate-bounce-slow"
            />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {userInfo.first_name} {userInfo.last_name}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Đang tải thông tin người dùng...</p>
        )}

        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          {callType === 'audio' ? 'Cuộc gọi âm thanh' : 'Cuộc gọi video'} 
        </p>

        <button
          onClick={onCancel}
          className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-colors"
        >
          Huỷ cuộc gọi
        </button>
      </div>
    </div>
  );
};
