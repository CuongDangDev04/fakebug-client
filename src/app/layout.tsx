import type { Metadata } from "next";
import "./globals.css";
import NotificationSocketHandler from "@/components/notifications/NotificationSocketHandler";
import { Toaster } from "sonner";
import ChatSocketHandler from "@/components/messages/ChatSocketHandler";


export const metadata: Metadata = {
  title: "FakeBug",
  icons: {
    icon: "/lg.png",
  },
  description: "Mạng xã hội FakeBug",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <ChatSocketHandler />
        <NotificationSocketHandler />
        {children}
      </body>
    </html>
  );
}
