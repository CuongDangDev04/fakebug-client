'use client';
import { useChatSocket } from '@/hooks/useChatSocket';

export default function ChatSocketHandler() {
    useChatSocket();
    return null;
}
