'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { postService } from '@/services/postService';
import { useUserStore } from '@/stores/userStore';
import type { PostResponse } from '@/types/post';
import Modal from './ModalCreat';
import PrivacySelect from './PrivacySelect';

interface EditPostModalProps {
    post: PostResponse;
    isOpen: boolean;
    onClose: () => void;
    onPostUpdated: (updatedPost: PostResponse) => void;
}

export default function EditPostModal({
    post,
    isOpen,
    onClose,
    onPostUpdated,
}: EditPostModalProps) {
    const { user } = useUserStore();
    const userId = user?.id;

    const [content, setContent] = useState(post.content);
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>(post.privacy || 'friends');
    const [imagePreview, setImagePreview] = useState<string | null>(post.media_url || null);
    const [file, setFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFile(null);
        setRemoveImage(true);
    };

    const handleUpdatePost = async () => {
        if (!userId) return;
        setLoading(true);

        try {
            const res = await postService.updatePost(post.id, {
                content,
                userId,
                file: file || undefined,
                removeImage,
                privacy,
            });

            onPostUpdated(res.data);
            onClose();
        } catch (error) {
            console.error('Cập nhật bài viết thất bại:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setContent(post.content);
            setPrivacy(post.privacy || 'friends');
            setImagePreview(post.media_url || null);
            setFile(null);
            setRemoveImage(false);
        }
    }, [isOpen, post]);

    if (!userId) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img src={user?.avatar_url || '/default-avatar.png'} alt="Avatar" className="object-cover w-full h-full" />
                </div>
                <p className="font-semibold dark:text-white">{user?.first_name} {user?.last_name}</p>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder={`${user?.first_name} ơi, bạn đang nghĩ gì thế?`}
                className="w-full bg-gray-100 dark:bg-dark-bg dark:text-white rounded-xl px-3 py-2 mb-4 resize-none"
            />

            {/* Privacy Select */}
          <PrivacySelect value={privacy} onChange={setPrivacy} />

            {imagePreview && (
                <div className="mb-4 relative">
                    <img src={imagePreview} alt="Ảnh bài viết" className="w-full rounded-lg" />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full"
                        title="Xóa ảnh"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 mt-3">
                <label className="flex items-center gap-2 text-blue-600 font-medium cursor-pointer">
                    <ImageIcon className="w-5 h-5" />
                    Ảnh
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                    />
                </label>

                <button
                    onClick={handleUpdatePost}
                    disabled={loading}
                    className="bg-blue-600 text-white font-medium px-4 py-1.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : 'Cập nhật'}
                </button>
            </div>
        </Modal>
    );
}
