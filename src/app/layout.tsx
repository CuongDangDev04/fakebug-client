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
