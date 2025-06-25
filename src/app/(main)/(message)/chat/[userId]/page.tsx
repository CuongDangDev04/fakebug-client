'use client'
import ChatBox from "@/components/messages/ChatBox";
import { useUserStore } from "@/stores/userStore";
import { use } from "react";

interface ChatPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function ChatPage(props: ChatPageProps) {
    const { userId } = use(props.params);
    const currentuserId = useUserStore((state) => state.user?.id)
    const currentUserId = Number(currentuserId);
    const targetUserId = parseInt(userId);

    if (!currentUserId || !targetUserId) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    return (
        <>
            <ChatBox currentUserId={currentUserId} targetUserId={targetUserId} />
        </>
    );
}
