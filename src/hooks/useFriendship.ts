import { useState } from 'react';
import { friendshipService } from '@/services/friendshipService';
import { notificationService } from '@/services/notificationService';
import { useUserStore } from '@/stores/userStore';
import { showNotificationToast } from '@/components/notifications/NotificationToast';

export const useFriendship = () => {
    const [loading, setLoading] = useState(false);
    const currentUser = useUserStore((state) => state.user);
    const currentUserFullName = `${currentUser?.first_name ?? ''} ${currentUser?.last_name ?? ''}`.trim();
    const currentUserAvatar = currentUser?.avatar_url || '/default-avatar.png';

    const sendFriendRequest = async (targetId: number) => {
        try {
            setLoading(true);
            await friendshipService.sendFriendRequest(targetId);
            await notificationService.sendNotification(
                targetId, 
                `Đã nhận lời mời kết bạn từ ${currentUserFullName}`,
                "/friends/loi-moi-ket-ban-da-nhan",
                currentUserAvatar // Now using the default-backed avatar URL
            );
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
                    "/ban-be",
                    currentUserAvatar // Now using the default-backed avatar URL
                );
                
                showNotificationToast({
                    avt: fromUser.avatar || '/default-avatar.png', // Added fallback for user avatar
                    message: `Phản hồi lời mời kết bạn của ${fromUser.firstName} ${fromUser.lastName} thành công`,
                    createdAt: '1 phút trước',
                    url: '/ban-be',
                    navigate: () => {}
                });
            }
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
            return true;
        } catch (error) {
            console.error('Lỗi khi hủy lời mời:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách bạn bè của một người dùng cụ thể
    const getOtherUserFriends = async (userId: number) => {
        try {
            setLoading(true);
            const response = await friendshipService.getUserFriends(userId);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tải danh sách bạn bè:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra trạng thái và gửi lời mời kết bạn cho bạn bè của người khác
    const addFriendFromOtherList = async (targetId: number) => {
        try {
            setLoading(true);
            const status:any = await friendshipService.checkFriendshipStatus(targetId);
            if (status.data === 'NOT_FRIEND') {
                return await sendFriendRequest(targetId);
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi thêm bạn:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra bạn chung với một người trong danh sách
    const checkMutualFriends = async (targetId: number) => {
        try {
            const response = await friendshipService.getMutualFriends(targetId);
            return response.data;
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
        checkMutualFriends
    };
};
