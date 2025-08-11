'use client'

import MainWrapper from "@/components/common/users/MainWrapper";
import PostList from "@/components/posts/PostList";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <MainWrapper>
      <div className="relative">
        {/* Feed luôn render và giữ trong DOM */}
        <div className="overflow-auto h-screen">
          <PostList />
        </div>

        {/* Nếu không ở home, overlay children lên trên */}
        {!isHome && (
          <div className="absolute inset-0 bg-white z-10 overflow-auto">
            {children}
          </div>
        )}

        {/* Nếu ở home, render children bình thường */}
        {isHome && children}
      </div>
    </MainWrapper>
  );
}
    