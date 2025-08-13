import { useState } from 'react';
import { friendshipService } from '@/services/friendshipService';
import { notificationService } from '@/services/notificationService';
import { useUserStore } from '@/stores/userStore';
import { useFriendStore } from '@/stores/friendStore';
import { showNotificationToast } from '@/components/notifications/NotificationToast';

export const useFriendship = () => {
  const [loading, setLoading] = useState(false);
  const currentUser = useUserStore((state) => state.user);
  const currentUserFullName = `${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim();
  const currentUserAvatar = currentUser?.avatar_url || '/default-avatar.png';

  const loadFriends = useFriendStore(state => state.loadFriends);
  const loadReceivedRequests = useFriendStore(state => state.loadReceivedRequests);
  const loadSentRequests = useFriendStore(state => state.loadSentRequests);
  const loadSuggestions = useFriendStore(state => state.loadSuggestions);
  const loadBlockedUsers = useFriendStore(state => state.loadBlockedUsers);

  const sendFriendRequest = async (targetId: number) => {
    try {
      setLoading(true);
      await friendshipService.sendFriendRequest(targetId);
      await notificationService.sendNotification(
        targetId,
        `Đã nhận lời mời kết bạn từ ${currentUserFullName}`,
        "/ban-be/loi-moi-ket-ban-da-nhan",
        currentUserAvatar
      );

      // Chỉ reset suggestions vì danh sách bạn bè chưa thay đổi
      useFriendStore.getState().resetHasLoadedSuggestions();
      useFriendStore.getState().resetHasLoadedSentRequests();
      
      await loadSuggestions();

      return true;
    } catch (error) {
      console.error('Lỗi khi gửi lời mời kết bạn:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const respondToFriendRequest = async (requestId: number, accept: boolean, fromUser: any) => {
    try {
      setLoading(true);
      await friendshipService.respondToRequest(requestId, accept);

      if (accept) {
        await notificationService.sendNotification(
          fromUser.id,
          `${currentUserFullName} đã chấp nhận lời mời kết bạn của bạn`,
          "/ban-be/tat-ca",
          currentUserAvatar
        );

        showNotificationToast({
          avt: fromUser.avatar || '/default-avatar.png',
          message: `Phản hồi lời mời kết bạn của ${fromUser.firstName} ${fromUser.lastName} thành công`,
          createdAt: '1 phút trước',
          url: '/ban-be/tat-ca',
          navigate: () => {}
        });

        // Reload friends và reset hasLoadedFriends
        useFriendStore.getState().resetHasLoadedFriends();
        useFriendStore.getState().resetHasLoadedSuggestions();

        await loadFriends();
      }

      // Reload received requests
      useFriendStore.getState().resetHasLoadedReceivedRequests();
      await loadReceivedRequests();

      return true;
    } catch (error) {
      console.error('Lỗi khi phản hồi lời mời:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unfriend = async (targetId: number) => {
    try {
      setLoading(true);
      await friendshipService.unfriend(targetId);

      // Reload friends
      useFriendStore.getState().resetHasLoadedFriends();
      useFriendStore.getState().resetHasLoadedSuggestions();

      await loadFriends();

      return true;
    } catch (error) {
      console.error('Lỗi khi hủy kết bạn:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelFriendRequest = async (targetId: number) => {
    try {
      setLoading(true);
      await friendshipService.cancelSentRequest(targetId);

      // Reload sent requests
      useFriendStore.getState().resetHasLoadedSentRequests();
      useFriendStore.getState().resetHasLoadedSuggestions();

      await loadSentRequests();

      return true;
    } catch (error) {
      console.error('Lỗi khi hủy lời mời:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getOtherUserFriends = async (userId: number) => {
    try {
      setLoading(true);
      const response = await friendshipService.getUserFriends(userId);
      return response?.data;
    } catch (error) {
      console.error('Lỗi khi tải danh sách bạn bè:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addFriendFromOtherList = async (targetId: number) => {
    try {
      setLoading(true);
      const status: any = await friendshipService.checkFriendshipStatus(targetId);
      if (status.data === 'NOT_FRIEND') {
        const success = await sendFriendRequest(targetId);
        if (success) {
          await loadFriends();
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error('Lỗi khi thêm bạn:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkMutualFriends = async (targetId: number) => {
    try {
      const response = await friendshipService.getMutualFriends(targetId);
      return response?.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra bạn chung:', error);
      return null;
    }
  };

  return {
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    unfriend,
    cancelFriendRequest,
    getOtherUserFriends,
    addFriendFromOtherList,
    checkMutualFriends,
  };
};
