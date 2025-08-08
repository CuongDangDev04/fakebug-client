// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import { House } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-start dark:bg-dark-bg text-center px-4">
      {/* Logo */}
      <Image
        src="/lg.png"
        alt="Website Logo"
        width={80}
        height={80}
        className="mb-6 drop-shadow-md"
        priority
      />

      {/* 404 Title */}
      <h1 className="text-7xl font-extrabold text-primary-500 dark:text-dark-text-primary">
        404
      </h1>

      {/* Subtitle */}
      <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-dark-text-primary">
        Oops! Trang bạn tìm không tồn tại.
      </h2>

      {/* Description */}
      <p className="mt-2 text-gray-500 dark:text-dark-text-secondary max-w-md">
        Có thể đường dẫn đã bị thay đổi hoặc bị xóa. Hãy quay lại trang chủ để tiếp tục.
      </p>

      {/* Action Button */}
      <Link
        href="/"
        className="mt-6 flex flex-row rounded-lg bg-primary-500 px-6 py-3 text-white font-medium shadow hover:bg-primary-600 dark:bg-dark-button-primary dark:hover:bg-dark-button-hover transition-colors duration-200"
      >
        <House /> Quay lại Trang chủ
      </Link>
    </div>
  );
}
