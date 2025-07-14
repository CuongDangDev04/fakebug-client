
import './globals.css';
import { Toaster } from 'sonner';
import NotificationSocketHandler from '@/components/notifications/NotificationSocketHandler';
import ChatSocketHandler from '@/components/messages/ChatSocketHandler';
import { CallHandlerWrapper } from '@/components/call/CallHandlerWrapper';

export const metadata = {
  title: 'FakeBug',
  icons: {
    icon: '/lg.png',
  },
  description: 'Mạng xã hội FakeBug',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
