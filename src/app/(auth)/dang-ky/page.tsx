import RegisterCard from "@/components/auth/RegisterCard";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng ký | FakeBug - Mạng xã hội',
  description: 'Tạo tài khoản FakeBug miễn phí để bắt đầu chia sẻ, kết bạn và trải nghiệm nền tảng mạng xã hội hiện đại.',
  robots: 'index, follow',
  keywords: ['fakebug', 'đăng ký', 'mạng xã hội', 'kết bạn', 'chia sẻ'],
  openGraph: {
    title: 'Đăng ký | FakeBug',
    description: 'Bắt đầu hành trình cùng cộng đồng sôi động trên FakeBug.',
    url: 'https://fakebug.vercel.app/dang-ky',
    siteName: 'FakeBug',
    images: [
      {
        url: 'https://fakebug.vercel.app/lg.png',
        width: 1200,
        height: 630,
        alt: 'Đăng ký FakeBug',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Đăng ký | FakeBug',
    description: 'Tham gia FakeBug để chia sẻ và kết nối với mọi người.',
    images: ['https://fakebug.vercel.app/lg.png'],
  },
};

export default function RegisterPage() {
  return <RegisterCard />;
}
