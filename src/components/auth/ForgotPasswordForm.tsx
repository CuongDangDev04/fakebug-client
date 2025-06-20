import { useState } from 'react';
import { authService } from '@/services/authService';
import type { ForgotPasswordDto } from '@/types/auth';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const forgotPasswordData: ForgotPasswordDto = { email };
      const response = await authService.forgotPassword(forgotPasswordData);
      setSuccess(response.message);
      // Redirect to reset password page with email
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
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
          placeholder="Nhập email của bạn"
          className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#40c9db]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-500 text-sm">{success}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#40c9db] to-[#5ce0f0] hover:from-[#2bb5c9] hover:to-[#40c9db] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
      </button>
    </form>
  );
}
