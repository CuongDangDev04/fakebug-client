import Link from 'next/link';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function ForgotPasswordCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white/30 backdrop-blur-md p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl space-y-4 relative border border-white/40">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/lg.png" alt="Logo" width={60} height={60} className="object-contain" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Quên mật khẩu</h2>
            <p className="text-sm lg:text-base text-gray-600">Nhập email của bạn để nhận mã OTP</p>
          </div>
          
          <ForgotPasswordForm />
          
          <div className="text-center text-sm lg:text-base text-gray-600">
            <Link href="/dang-nhap" className="text-[#40c9db] hover:text-[#2bb5c9] font-medium">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
