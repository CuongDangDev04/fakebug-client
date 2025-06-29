'use client'
import ChatBox from "@/components/messages/ChatBox";
import ChatSidebar from "@/components/messages/ChatSidebar";
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
        <div className="flex h-full" style={{height: '100vh'}}>
            <div className="w-80 border-r h-full">
                <ChatSidebar currentUserId={currentUserId} />
            </div>
            <div className="flex-1 h-full">
                <ChatBox currentUserId={currentUserId} targetUserId={targetUserId} />
            </div>
        </div>
    );
}
