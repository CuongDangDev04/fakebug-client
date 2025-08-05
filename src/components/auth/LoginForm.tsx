'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { cookieService } from '@/services/cookieService';
import type { LoginUserDto } from '@/types/auth';
import { useUserStore } from '@/stores/userStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData: LoginUserDto = {
        emailOrUsername,
        password,
      };

      const response = await authService.loginLocal(loginData);

      // 👉 Kiểm tra nếu bị lỗi như "401 - Unauthorized"
      if (response.statusCode && response.statusCode !== 200) {
        toast.error(response.message || 'Đăng nhập thất bại.');
        return;
      }

      if (response.access_token) {
        cookieService.setAccessToken(response.access_token);
        cookieService.setRefreshToken(response.refresh_token);

        const user = await authService.getInfoUser();

        if (!user) {
          toast.error('Không thể lấy thông tin người dùng.');
          return;
        }

        if (user.is_disabled) {
          toast.error('Tài khoản của bạn đã bị vô hiệu hóa.');
          return;
        }

        useUserStore.getState().setUser(user);

        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Email hoặc tên đăng nhập"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-end text-xs">
          <Link href="/quen-mat-khau" className="text-[#40c9db] hover:text-[#2bb5c9] font-medium">
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#40c9db] to-[#5ce0f0] hover:from-[#2bb5c9] hover:to-[#40c9db] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
