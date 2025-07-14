'use client';

import { useUserStore } from '@/stores/userStore';
import { CallHandler } from './CallHandler';

export const CallHandlerWrapper = () => {
  const userId = useUserStore((state) => state.user?.id);
    const myUserId = Number(userId)
  if (!myUserId) return null;

  return <CallHandler currentUserId={myUserId} />;
};
