
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
  const [activeFriendTab, setActiveFriendTab] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === '/ban-be/tat-ca') setActiveFriendTab('allFriends');
    else if (pathname === '/ban-be/loi-moi-ket-ban-da-nhan') setActiveFriendTab('receivedRequests');
    else if (pathname === '/ban-be/loi-moi-ket-ban-da-gui') setActiveFriendTab('sentRequests');
    else if (pathname === '/ban-be/goi-y') setActiveFriendTab('suggestions');
    else if (pathname === '/ban-be/danh-sach-chan') setActiveFriendTab('blockedList');
    else setActiveFriendTab(null);
  }, [pathname]);

  if (!mounted) return null;

  const isHome = pathname === '/';
  const isNotifications = pathname === '/thong-bao';
  const isMyProfile = pathname === '/trang-ca-nhan';

  return (
    <MainWrapper>
      <div className="relative ">

        {/* Home Feed */}
        <div className={`${isHome ? 'block' : 'hidden'} overflow-auto h-full`}>
          <PostList />
        </div>

        {/* Notifications */}
        <div className={`${isNotifications ? 'block' : 'hidden'} overflow-auto h-full`}>
          <AllNotifications />
        </div>

        {/* My Profile */}
        <div className={`${isMyProfile ? 'block' : 'hidden'} overflow-auto h-full`}>
          <MyProfile />
        </div>

        {/* Friends */}
        <div className={`${activeFriendTab ? 'block' : 'hidden'} overflow-auto h-full`}>
          <FriendWrapper>
            <div className={activeFriendTab === 'allFriends' ? 'block' : 'hidden'}>
              <FriendsList />
            </div>
            <div className={activeFriendTab === 'receivedRequests' ? 'block' : 'hidden'}>
              <ReceivedRequests />
            </div>
            <div className={activeFriendTab === 'sentRequests' ? 'block' : 'hidden'}>
              <SentRequests />
            </div>
            <div className={activeFriendTab === 'suggestions' ? 'block' : 'hidden'}>
              <FriendSuggestions />
            </div>
            <div className={activeFriendTab === 'blockedList' ? 'block' : 'hidden'}>
              <BlockedUserList />
            </div>
          </FriendWrapper>
        </div>

        {/* Other pages */}
        <div
          className={`${(!isHome && !isNotifications && !isMyProfile && !activeFriendTab) ? 'block' : 'hidden'} overflow-auto h-full`}
        >
          {children}
        </div>
      </div>
    </MainWrapper>
  );
}

