'use client';

import { useState, useRef } from 'react';
import { Image, Send, X } from 'lucide-react';
import { postService } from '@/services/postService';
import { useUserStore } from '@/stores/userStore';
import PrivacySelect from './PrivacySelect';

export default function CreatePost({ onPostSuccess }: { onPostSuccess?: () => void }) {
    const [content, setContent] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('friends');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = useUserStore((state) => state.user);
    if (!currentUser) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !imageFile) return;
        setLoading(true);

        try {
            await postService.createPost({
                content: content.trim(),
                userId: currentUser.id,
                file: imageFile || undefined,
                privacy: privacy,
            });

            setContent('');
            setPrivacy('friends');
            setImagePreview(null);
            setImageFile(null);
            onPostSuccess?.();
        } catch (err) {
            console.error('Lỗi tạo bài viết:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 bg-white dark:bg-dark-card rounded-lg p-4 shadow">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={currentUser.avatar_url || '/default-avatar.png'}
                        alt="User Avatar"
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {currentUser.first_name} {currentUser.last_name}
                </div>
            </div>

            {/* Textarea */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Bạn đang nghĩ gì thế?"
                className="w-full resize-none bg-gray-100 dark:bg-dark-hover dark:text-gray-200 rounded-lg p-3 text-sm focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />

            {/* Privacy Select */}
            <PrivacySelect value={privacy} onChange={setPrivacy} />

            {/* Image Preview */}
            {imagePreview && (
                <div className="relative">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded-lg object-cover max-h-80 w-full border"
                    />
                    <button
                        onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center border-t dark:border-gray-700 pt-3">
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold"
                    >
                        <Image className="w-5 h-5" />
                        Ảnh
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-50"
                >
                    {loading ? 'Đang đăng...' : 'Đăng'}
                </button>
            </div>
        </div>
    );
}
