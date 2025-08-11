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
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const isHome = pathname === '/';
  const isNotifications = pathname === '/thong-bao';
  const isMyProfile = pathname === '/trang-ca-nhan';
  const isAllFriends = pathname === '/ban-be/tat-ca';
  const isReceivedRequests = pathname === '/ban-be/loi-moi-ket-ban-da-nhan';
  const isSentRequests = pathname === '/ban-be/loi-moi-ket-ban-da-gui';
  const isSuggestions = pathname === '/ban-be/goi-y';
  const isBlockedList = pathname === '/ban-be/danh-sach-chan';

  return (
    <MainWrapper>
      <div className="relative h-screen">

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
        <div className={`${(isAllFriends || isReceivedRequests || isSentRequests || isSuggestions || isBlockedList) ? 'block' : 'hidden'} overflow-auto h-full`}>
          <FriendWrapper>
            <div className={`${isAllFriends ? 'block' : 'hidden'}`}><FriendsList /></div>
            <div className={`${isReceivedRequests ? 'block' : 'hidden'}`}><ReceivedRequests /></div>
            <div className={`${isSentRequests ? 'block' : 'hidden'}`}><SentRequests /></div>
            <div className={`${isSuggestions ? 'block' : 'hidden'}`}><FriendSuggestions /></div>
            <div className={`${isBlockedList ? 'block' : 'hidden'}`}><BlockedUserList /></div>
          </FriendWrapper>
        </div>

        {/* Other pages */}
        <div className={`${(!isHome && !isNotifications && !isMyProfile && !isAllFriends && !isReceivedRequests && !isSentRequests && !isSuggestions && !isBlockedList) ? 'block' : 'hidden'} overflow-auto h-full`}>
          {children}
        </div>
      </div>
    </MainWrapper>
  );
}
