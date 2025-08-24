'use client'

import { useState, useEffect } from "react";
import MainWrapper from "@/components/common/users/MainWrapper";
import PostList from "@/components/posts/PostList";
import AllNotifications from "@/components/notifications/AllNotifications";
import MyProfile from "@/components/profile/MyProfile";
import ReceivedRequests from "@/components/friends/ReceivedRequests";
import SentRequests from "@/components/friends/SentRequests";
import FriendSuggestions from "@/components/friends/FriendSuggestions";
import { usePathname } from "next/navigation";
import BlockedUserList from "@/components/friends/BlockedUserList";
import FriendsList from "@/components/friends/FriendsList";
import FriendWrapper from "@/components/common/users/FriendWrapper";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isHome = pathname === '/';
  const isNotifications = pathname === '/thong-bao';
  const isMyProfile = pathname === '/trang-ca-nhan';
  const isFriends = pathname?.startsWith('/ban-be');

  const friendTab =
    pathname === '/ban-be/tat-ca' ? 'allFriends' :
    pathname === '/ban-be/loi-moi-ket-ban-da-nhan' ? 'receivedRequests' :
    pathname === '/ban-be/loi-moi-ket-ban-da-gui' ? 'sentRequests' :
    pathname === '/ban-be/goi-y' ? 'suggestions' :
    pathname === '/ban-be/danh-sach-chan' ? 'blockedList' :
    null;

  return (
    <MainWrapper>
      {/* Đảm bảo có chiều cao rõ ràng để absolute children hiển thị */}
      <div className="flex h-screen overflow-hidden">
        <div className="relative flex-1 min-h-0 w-full">

          {/* Home Feed */}
          <div className={`${isHome ? 'block' : 'hidden'} absolute inset-0 overflow-auto`}>
            <PostList />
          </div>

          {/* Notifications */}
          <div className={`${isNotifications ? 'block' : 'hidden'} absolute inset-0 overflow-auto`}>
            <AllNotifications />
          </div>

          {/* My Profile */}
          <div className={`${isMyProfile ? 'block' : 'hidden'} absolute inset-0 overflow-auto`}>
            <MyProfile />
          </div>

          {/* Friends */}
          <div className={`${isFriends ? 'block' : 'hidden'} absolute inset-0 overflow-auto`}>
            <FriendWrapper>
              <div className={friendTab === 'allFriends' ? 'block' : 'hidden'}>
                <FriendsList />
              </div>
              <div className={friendTab === 'receivedRequests' ? 'block' : 'hidden'}>
                <ReceivedRequests />
              </div>
              <div className={friendTab === 'sentRequests' ? 'block' : 'hidden'}>
                <SentRequests />
              </div>
              <div className={friendTab === 'suggestions' ? 'block' : 'hidden'}>
                <FriendSuggestions />
              </div>
              <div className={friendTab === 'blockedList' ? 'block' : 'hidden'}>
                <BlockedUserList />
              </div>
            </FriendWrapper>
          </div>

          {/* Other pages */}
          <div className={`${(!isHome && !isNotifications && !isMyProfile && !isFriends) ? 'block' : 'hidden'} absolute inset-0 overflow-auto`}>
            {children}
          </div>
        </div>
      </div>
    </MainWrapper>
  );
}
