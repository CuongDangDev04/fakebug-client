'use client'
import { useState } from 'react';
import { authService } from '@/services/authService';
import { cookieService } from '@/services/cookieService';
import type { RegisterUserDto } from '@/types/auth';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterUserDto>({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.registerLocal(formData);
      if (response.access_token) {
        cookieService.setAccessToken(response.access_token);
        const user = await authService.getInfoUser();
        if (user) {
          useUserStore.getState().setUser(user);
          router.push('/');
        } else {
          setError('Đăng ký thất bại');
        }
      }
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.username}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="first_name"
            placeholder="Họ"
            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
            value={formData.first_name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="last_name"
            placeholder="Tên"
            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#40c9db] to-[#5ce0f0] hover:from-[#2bb5c9] hover:to-[#40c9db] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  );
}
