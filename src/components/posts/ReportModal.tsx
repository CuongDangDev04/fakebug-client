'use client';

import { useState, useEffect } from 'react';
import { X, Send, Ban } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
            setReason('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fadeIn transition-all duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title="Đóng"
                >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                    Báo cáo bài viết
                </h2>

                {/* Textarea */}
                <textarea
                    placeholder="Hãy nhập lý do báo cáo chi tiết để chúng tôi xử lý tốt hơn..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1e1e] p-3 h-32 resize-none text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                        <Ban size={16} /> Huỷ
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition"
                    >
                        <Send size={16} /> Gửi báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
}
