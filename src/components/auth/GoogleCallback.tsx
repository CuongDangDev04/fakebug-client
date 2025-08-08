'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useUserStore } from '@/stores/userStore';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams?.get('error');
    const access_token = searchParams?.get('access_token');
    const refresh_token = searchParams?.get('refresh_token');
    const userString = searchParams?.get('user');

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      return;
    }

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
        router.push(user.role === 'admin' ? '/admin' : '/');
      } catch (err) {
        setErrorMsg('Lỗi khi phân tích thông tin người dùng');
      }
    } else {
      setErrorMsg('Thiếu token hoặc thông tin người dùng');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6 text-center space-y-6">
        <div className="flex justify-center gap-3 items-center">
          <img src="/lg.png" alt="Logo website" className="w-12 h-12" />
          <img src="/logo_google.png" alt="Google" className="w-8 h-8 opacity-80" />
        </div>

        {errorMsg ? (
          <>
            <h2 className="text-2xl font-medium text-red-600">Đăng nhập thất bại</h2>
            <p className="text-base text-gray-500">{errorMsg}</p>
            <button
              onClick={() => router.push('/dang-nhap')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Quay lại trang đăng nhập
            </button>
          </>
        ) : (
          <>
            <div className="inline-block">
              <div className="w-10 h-10 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-medium text-gray-700">Đang xử lý đăng nhập...</h2>
          </>
        )}
      </div>
    </div>
  );
}
