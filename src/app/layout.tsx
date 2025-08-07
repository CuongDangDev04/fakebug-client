import './globals.css';
import { Toaster } from 'sonner';
import NotificationSocketHandler from '@/components/notifications/NotificationSocketHandler';
import ChatSocketHandler from '@/components/messages/ChatSocketHandler';
import { CallHandlerWrapper } from '@/components/call/CallHandlerWrapper';

export const metadata = {
  title: 'FakeBug',
  description: 'Mạng xã hội FakeBug',
  icons: {
    icon: '/lg.png',
  }, 
  openGraph: {
    title: 'FakeBug - Mạng xã hội',
    description: 'Kết nối với bạn bè và chia sẻ khoảnh khắc thú vị.',
    url: 'https://fakebug.vercel.app',
    siteName: 'FakeBug',
    images: [
      {
        url: 'https://fakebug.vercel.app/lg.png', 
        width: 1200,
        height: 630,
        alt: 'FakeBug Preview',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  other: {
    'google-site-verification': '8cpVrNgWjVy86NmKpzl7yQRiVAx3WXPfKkcjFYgq7N8',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <CallHandlerWrapper />
        <Toaster position="top-right" />
        <ChatSocketHandler />
        <NotificationSocketHandler />
        {children}
      </body>
    </html>
  );
}
