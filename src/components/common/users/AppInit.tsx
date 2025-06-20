'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { authService } from '@/services/authService';
import { cookieService } from '@/services/cookieService';

const PUBLIC_ROUTES = [
  '/dang-nhap',
  '/dang-ky',
  '/quen-mat-khau',
  '/doi-mat-khau'
];

export default function AppInit() {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      // Trang public
      if (PUBLIC_ROUTES.some((route) => pathname.includes(route))) {
        const token = cookieService.getAccessToken();
        if (token) {
          router.push('/');
        }
        return;
      }

      // Trang bảo vệ
      const token = cookieService.getAccessToken();
      if (!token) {
        router.push('/dang-nhap');
        return;
      }

      if (!user) {
        try {
          const userData = await authService.getInfoUser();
          if (userData) {
            setUser(userData);
          } else {
            router.push('/dang-nhap');
          }
        } catch (err) {
          console.warn('Không lấy được thông tin người dùng:', err);
          router.push('/dang-nhap');
        }
      }
    };

    fetchUser();
  }, [pathname, setUser, user, router]);

  return null;
}
