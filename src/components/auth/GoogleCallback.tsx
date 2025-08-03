'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useUserStore } from '@/stores/userStore';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const access_token = searchParams!.get('access_token');
    const refresh_token = searchParams!.get('refresh_token');
    const userString = searchParams!.get('user');

    if (access_token && refresh_token && userString) {
      Cookies.set('access_token', access_token, {
        expires: 7,
        path: '/',
        sameSite: 'strict',
      });

      Cookies.set('refresh_token', refresh_token, {
        expires: 30,
        path: '/',
        sameSite: 'strict',
      });

      try {
        const user = JSON.parse(decodeURIComponent(userString));
        useUserStore.getState().setUser(user);
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error('Lỗi khi phân tích user', err);
        router.push('/dang-nhap');
      }
    } else {
      console.error('Thiếu token hoặc user');
      router.push('/dang-nhap');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6">
        <div className="text-center space-y-6">
          <div className="inline-block">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
          <div>
            <h2 className="text-2xl font-medium text-gray-700">Xác thực đăng nhập</h2>
            <p className="text-base text-gray-500 mt-2">Đang xử lý...</p>
          </div>
          <div className="flex justify-center">
            <img src="/logo_google.png" alt="Google" className="w-8 h-8 opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
}
