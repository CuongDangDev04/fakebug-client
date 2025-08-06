import LoginCard from "@/components/auth/LoginCard";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập | FakeBug - Mạng xã hội',
  description: 'Đăng nhập vào FakeBug để kết nối, chia sẻ và khám phá cộng đồng sôi động.',
  robots: 'index, follow',
  keywords: ['fakebug', 'đăng nhập', 'mạng xã hội', 'kết nối', 'chia sẻ'],
  openGraph: {
    title: 'Đăng nhập | FakeBug',
    description: 'Truy cập tài khoản FakeBug để tương tác và kết nối với mọi người.',
    url: 'https://fakebug.vercel.app/dang-nhap',
    siteName: 'FakeBug',
    images: [
      {
        url: 'https://fakebug.vercel.app/lg.png',
        width: 1200,
        height: 630,
        alt: 'Đăng nhập FakeBug',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Đăng nhập | FakeBug',
    description: 'Truy cập FakeBug để kết nối và chia sẻ cùng bạn bè.',
    images: ['https://fakebug.vercel.app/lg.png'],
  },
};

export default function LoginPage() {
  return <LoginCard />;
}
