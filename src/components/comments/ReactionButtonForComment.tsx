'use client';

import { useState, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';
import { commentService } from '@/services/commentService';
import { useUserStore } from '@/stores/userStore';
import type { ReactionType } from '@/types/post';

const reactions = [
    { name: 'Thích', url: '/reactions/like.svg', type: 'like' },
    { name: 'Yêu thích', url: '/reactions/love.svg', type: 'love' },
    { name: 'Haha', url: '/reactions/haha.svg', type: 'haha' },
    { name: 'Wow', url: '/reactions/wow.svg', type: 'wow' },
    { name: 'Buồn', url: '/reactions/sad.svg', type: 'sad' },
    { name: 'Phẫn nộ', url: '/reactions/angry.svg', type: 'angry' },
];

const reactionColors: Record<ReactionType, string> = {
    like: 'text-blue-600 dark:text-[#4497f5]',
    love: 'text-red-500',
    haha: 'text-yellow-500',
    wow: 'text-yellow-500',
    sad: 'text-yellow-500',
    angry: 'text-orange-500',
};

export default function ReactionButtonForComment({
    commentId,
    initialReaction,
    initialReactions,
    onReactionsUpdated,
}: {
    commentId: number;
    initialReaction: ReactionType | null;
    initialReactions: any[]; // mảng reactions từ backend
    onReactionsUpdated?: (reactions: any[]) => void; // callback để update tổng số
}) {
    const currentUser = useUserStore(state => state.user);

    const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(initialReaction);
    const [reactionsList, setReactionsList] = useState<any[]>(initialReactions);
    const [showReactions, setShowReactions] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateAndNotify = (newReactions: any[]) => {
        setReactionsList(newReactions);
        if (onReactionsUpdated) onReactionsUpdated(newReactions);
    };

    const handleReact = async (reaction: ReactionType) => {
        if (!currentUser) return;

        await commentService.reactToComment(commentId, currentUser.id, reaction);

        setSelectedReaction(reaction);
        setShowReactions(false);

        // Cập nhật local reactions:
        const otherReactions = reactionsList.filter(r => r.user.id !== currentUser.id);
        const newReactions = [...otherReactions, { user: currentUser, type: reaction }];
        updateAndNotify(newReactions);
    };

    const handleRemoveReaction = async () => {
        if (!currentUser) return;

        await commentService.reactToComment(commentId, currentUser.id, null);

        setSelectedReaction(null);

        // Xóa reaction khỏi danh sách local:
        const newReactions = reactionsList.filter(r => r.user.id !== currentUser.id);
        updateAndNotify(newReactions);
    };

    const handleButtonClick = async () => {
        if (selectedReaction) {
            await handleRemoveReaction();
        } else {
            await handleReact('like');
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowReactions(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowReactions(false);
        }, 200);
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
            <button
                onClick={handleButtonClick}
                className={`
                    flex items-center justify-center gap-1 px-3 h-8 rounded-lg 
                    dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-dark-hover 
                    ${selectedReaction ? reactionColors[selectedReaction] : ''}
                `}
            >
                {selectedReaction ? (
                    <img
                        src={reactions.find(r => r.type === selectedReaction)?.url || '/reactions/like.svg'}
                        alt={selectedReaction}
                        className="w-4 h-4"
                    />
                ) : (
                    <ThumbsUp size={14} />
                )}
                <span className="text-xs">
                    {selectedReaction
                        ? reactions.find(r => r.type === selectedReaction)?.name
                        : 'Thích'}
                </span>
            </button>

            

            {/* Bảng chọn reactions */}
            {showReactions && (
                <div className="absolute bottom-10 left-0 bg-white dark:bg-dark-card rounded-full shadow-lg flex gap-3 px-4 py-2 z-50 min-w-[300px] justify-center">
                    {reactions.map(r => (
                        <button
                            key={r.type}
                            onClick={() => handleReact(r.type as ReactionType)}
                            className="hover:scale-125 transition-transform"
                        >
                            <img src={r.url} alt={r.name} className="w-14 h-8" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
