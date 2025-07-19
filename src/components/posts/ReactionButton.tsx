'use client';

import { useEffect, useState, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';
import { postReactionsService } from '@/services/postReactionsService';
import { useUserStore } from '@/stores/userStore';
import { ReactedUser, ReactionType } from '@/types/post';


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

export default function ReactionButton({
    postId,
    reactedUsers,
    onReacted,
}: {
    postId: number;
    reactedUsers: ReactedUser[];
    onReacted?: (reaction: ReactionType | null) => void;
}) {
    const currentUser = useUserStore(state => state.user);

    const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
    const [showReactions, setShowReactions] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentUser) {
            const userReaction = reactedUsers.find(u => u.id === currentUser.id);
            setSelectedReaction(userReaction ? userReaction.type : null);
        }
    }, [currentUser, reactedUsers]);

    const handleReact = async (reaction: ReactionType) => {
        if (!currentUser) return;

        await postReactionsService.react(postId, currentUser.id, reaction);

        setSelectedReaction(reaction);
        setShowReactions(false);

        if (onReacted) onReacted(reaction);
    };

    const handleRemoveReaction = async () => {
        if (!currentUser) return;

        await postReactionsService.removeReaction(postId, currentUser.id);

        setSelectedReaction(null);

        if (onReacted) onReacted(null);
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
                    flex items-center justify-center gap-1 px-4 h-9 rounded-lg 
                    dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-dark-hover 
                    ${selectedReaction ? reactionColors[selectedReaction] : ''}
                `}
            >
                {selectedReaction ? (
                    <img
                        src={reactions.find(r => r.type === selectedReaction)?.url || '/reactions/like.svg'}
                        alt={selectedReaction}
                        className="w-5 h-5"
                    />
                ) : (
                    <ThumbsUp size={18} />
                )}
                <span className="text-sm font-medium">
                    {selectedReaction
                        ? reactions.find(r => r.type === selectedReaction)?.name
                        : 'Thích'}
                </span>
            </button>

            {showReactions && (
                <div className="absolute bottom-10 left-0 bg-white dark:bg-dark-card rounded-full shadow-lg flex gap-3 px-4 py-3 z-50 min-w-[340px] justify-center">
                    {reactions.map(r => (
                        <button
                            key={r.type}
                            onClick={() => handleReact(r.type as ReactionType)}
                            className="hover:scale-125 transition-transform"
                        >
                            <img src={r.url} alt={r.name} className="w-16 h-10" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
