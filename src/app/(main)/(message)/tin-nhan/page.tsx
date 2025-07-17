'use client'

import ChatSidebar from "@/components/messages/ChatSidebar";
import { useRouter } from "next/navigation";

export default function ChatDefaultPage() {
  const router = useRouter();

  const handleSelectUser = (userId: number) => {
    router.push(`/tin-nhan/${userId}`);
  };

  return (
    <div className="flex h-[80vh] relative">
      {/* Sidebar desktop */}
      <div className="hidden md:block w-80 border-r h-full">
        <ChatSidebar onSelectUser={handleSelectUser} />
      </div>

      {/* Sidebar mobile */}
      <div className="md:hidden fixed inset-0 ">
        <ChatSidebar mobileOpen={true} onSelectUser={handleSelectUser} />
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 flex items-center justify-center h-[90vh] bg-gray-50 dark:bg-dark-card">
        <div className="text-center">
          <img
            src="/lg.png"
            alt="Zalo Chat Banner"
            className="mx-auto mb-6 max-w-xs md:max-w-md"
            style={{ maxHeight: 240 }}
          />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Chào mừng bạn đến với FakeBug Chat!
          </h2>
          <p className="text-gray-500 dark:text-dark-text-secondary">
            Hãy chọn một cuộc trò chuyện.
          </p>
        </div>
      </div>
    </div>
  );
}
