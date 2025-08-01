'use client'
import { useState } from 'react';
import { authService } from '@/services/authService';
import { cookieService } from '@/services/cookieService';
import type { LoginUserDto } from '@/types/auth';
import { useUserStore } from '@/stores/userStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData: LoginUserDto = {
        emailOrUsername,
        password,
      };

      const response = await authService.loginLocal(loginData);
      if (response.access_token) {
        cookieService.setAccessToken(response.access_token);
        cookieService.setRefreshToken(response.refresh_token);
        const user = await authService.getInfoUser();
        if (user) {
          useUserStore.getState().setUser(user);
          router.push('/');
        } else {
          setError('Đăng nhập thất bại');
        }
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
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

      {error && <div className="text-red-500 text-sm">{error}</div>}

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
