'use client'

export default function ChatDefaultPage() {
  return (
    <div className="flex-1 flex items-center justify-center h-full bg-gray-50 dark:bg-dark-bg">
      <div className="text-center">
        <img
          src="/lg.png"
          alt="Chat Banner"
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
  )
}
