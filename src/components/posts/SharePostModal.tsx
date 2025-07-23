'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { postService } from '@/services/postService';
import { useUserStore } from '@/stores/userStore';
import Modal from './ModalCreat';
import PrivacySelect from './PrivacySelect';
import type { PostResponse } from '@/types/post';
import { useRouter } from 'next/navigation';

interface SharePostModalProps {
    originalPost: PostResponse;
    isOpen: boolean;
    onClose: () => void;
}

export default function SharePostModal({
    originalPost,
    isOpen,
    onClose,
}: SharePostModalProps) {
    const { user } = useUserStore();
    const router = useRouter();
    const userId = user?.id;

    const [content, setContent] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const res = await postService.sharePost(originalPost.id, {
                content,
                privacy,
                
            });

            onClose();
            router.push(`/bai-viet/${res.id}`);
        } catch (error) {
            console.error('Chia sẻ bài viết thất bại:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setContent('');
            setPrivacy('public');
        }
    }, [isOpen]);

    if (!userId) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img src={user?.avatar_url || '/default-avatar.png'} alt="Avatar" className="object-cover w-full h-full" />
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">
                    {user?.first_name} {user?.last_name}
                </p>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Bạn đang nghĩ gì khi chia sẻ bài viết này?"
                className="w-full bg-gray-100 dark:bg-dark-bg dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl px-3 py-2 mb-4 resize-none"
            />

            <PrivacySelect value={privacy} onChange={setPrivacy} />

            <div className="border rounded-md p-3 mt-4 bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-gray-300">
                <p className="italic text-gray-500 dark:text-gray-400 mb-1">Bài viết gốc:</p>
                <p className="whitespace-pre-line">{originalPost.content}</p>
                {originalPost.media_url && (
                    <div className="mt-2 rounded overflow-hidden">
                        <img src={originalPost.media_url} alt="Ảnh gốc" className="w-full rounded-md" />
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleShare}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium px-4 py-1.5 rounded-xl transition disabled:opacity-50"
                >
                    {loading ? 'Đang chia sẻ...' : 'Chia sẻ'}
                </button>
            </div>
        </Modal>
    );
}
