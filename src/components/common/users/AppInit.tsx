'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { authService } from '@/services/authService';

export default function AppInit() {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        try {
          const userData = await authService.getInfoUser();
          if (userData) setUser(userData);
        } catch (err) {
          console.warn('Không lấy được thông tin người dùng:', err);
        }
      }
    };

    fetchUser();
  }, [user, setUser]);

  return null;
}
