'use client';

import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteProps {
    title?: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmDelete({
    title = 'Xác nhận xoá?',
    description = 'Hành động này không thể hoàn tác.',
    onConfirm,
    confirmText = 'Xoá',
    cancelText = 'Huỷ',
}: ConfirmDeleteProps) {
    toast.custom((t) => (
        <div className="w-full max-w-sm p-4 rounded-lg shadow bg-white dark:bg-gray-900 space-y-3">
            <div className="flex items-start gap-3">
                <Trash2 className="text-red-600 dark:text-red-400 w-6 h-6 mt-1" />
                <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button
                    onClick={() => toast.dismiss(t)}
                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    {cancelText}
                </button>
                <button
                    onClick={async () => {
                        toast.dismiss(t);
                        try {
                            await onConfirm();
                        } catch (error) {
                            toast.error('Lỗi khi xoá.');
                            console.error(error);
                        }
                    }}
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    ));
}
