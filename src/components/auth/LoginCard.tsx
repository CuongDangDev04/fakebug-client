"use client"
import LoginForm from './LoginForm';
import GoogleLoginButton from './GoogleLoginButton';
import Link from 'next/link';

export default function LoginCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-6 lg:gap-16 px-4 lg:px-8">
        {/* Left Column - Branding */}
        <div className="w-full lg:w-1/2 text-center lg:text-left space-y-4 lg:space-y-6 mb-6 lg:mb-0">
          <div className="flex lg:justify-center justify-center">
            <img
              src="/lg.png"
              alt="Logo"
              width={80}
              height={80}
              className="w-16 h-16 lg:w-20  lg:h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight px-4 lg:px-0">
            Kết nối với bạn bè và<br className="hidden md:block" />
            <span className="text-[#2bb5c9] inline md:inline-block">chia sẻ khoảnh khắc</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-600 px-4 lg:px-0 max-w-lg mx-auto lg:mx-0">
            Tham gia cộng đồng của chúng tôi để khám phá những điều thú vị và kết nối với những người bạn mới.
          </p>

         
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto">
          <div className="bg-white/30 backdrop-blur-md p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl space-y-4 relative border border-white/40">
            <div className="text-center space-y-1 lg:space-y-2">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Đăng nhập</h2>
              <p className="text-sm lg:text-base text-gray-600">Chào mừng bạn trở lại!</p>
            </div>
            <LoginForm />
            <div className="flex items-center justify-between space-y-2">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-500 text-xs lg:text-sm px-2">hoặc</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <GoogleLoginButton />
            <div className="text-center text-sm lg:text-base text-gray-600 -mt-2">
              Chưa có tài khoản? {' '}
              <Link href="/dang-ky" className="text-[#40c9db] hover:text-[#2bb5c9] font-medium">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
