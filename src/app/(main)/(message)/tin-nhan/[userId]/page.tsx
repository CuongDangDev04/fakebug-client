"use client";
import ChatBox from "@/components/messages/ChatBox";
import ChatSidebar from "@/components/messages/ChatSidebar";
import { useUserStore } from "@/stores/userStore";
import { use } from "react";
import { useState } from "react";

interface ChatPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default function ChatPage(props: ChatPageProps) {
  const { userId } = use(props.params);
  const currentuserId = useUserStore((state) => state.user?.id);
  const currentUserId = Number(currentuserId);
  const targetUserId = parseInt(userId);

  // Responsive: trạng thái mở sidebar trên mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUserId || !targetUserId) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  return (
    <div className="flex h-full relative" style={{ height: "87vh" }}>
      {/* Sidebar: ẩn trên mobile, hiện khi sidebarOpen */}
      <div className="hidden md:block w-80 border-r h-full">
        <ChatSidebar />
      </div>
      {/* Sidebar mobile */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <ChatSidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      {/* ChatBox */}
      <div className="flex-1 h-full min-w-0">
        <ChatBox
          currentUserId={currentUserId}
          targetUserId={targetUserId}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
