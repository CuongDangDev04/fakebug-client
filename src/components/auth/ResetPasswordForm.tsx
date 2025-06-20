'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import type { ResetPasswordDto } from '@/types/auth';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = searchParams!.get('email');
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resetData: ResetPasswordDto = {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      };

      const response = await authService.resetPassword(resetData);

      if (response.message) {
        router.push('/login');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          readOnly
        />

        <input
          type="text"
          placeholder="Mã OTP"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.otp}
          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#40c9db] to-[#5ce0f0] hover:from-[#2bb5c9] hover:to-[#40c9db] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
}
