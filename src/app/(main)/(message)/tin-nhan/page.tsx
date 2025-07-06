'use client'
import ChatSidebar from "@/components/messages/ChatSidebar";

export default function ChatDefaultPage() {
  return (
    <div className="flex h-[80vh] relative">
      {/* Sidebar: ẩn trên mobile, hiện khi sidebarOpen */}
      <div className="hidden md:block w-80 border-r h-full">
        <ChatSidebar />
      </div>
      {/* Sidebar mobile */}
      <div className="md:hidden fixed inset-0 z-50">
        <ChatSidebar mobileOpen={true} />
      </div>
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