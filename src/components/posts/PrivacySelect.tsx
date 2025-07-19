'use client';

import { PrivacySelectProps } from '@/types/post';
import { useState, useEffect, useRef } from 'react';

const PRIVACY_OPTIONS = [
    { value: 'public', label: 'Công khai', icon: '🌐', description: 'Bất kỳ ai cũng có thể xem' },
    { value: 'friends', label: 'Bạn bè', icon: '👥', description: 'Chỉ bạn bè của bạn có thể xem' },
    { value: 'private', label: 'Chỉ mình tôi', icon: '🔒', description: 'Chỉ bạn có thể xem' },
];

export default function PrivacySelect({ value, onChange }: PrivacySelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentOption = PRIVACY_OPTIONS.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between bg-gray-100 dark:bg-dark-hover rounded-lg px-3 py-2 text-sm font-medium text-black dark:text-white"
            >
                <span>{currentOption?.icon} {currentOption?.label}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[40%]">
                    {currentOption?.description}
                </span>
            </button>

            {open && (
                <div className="absolute z-10 mt-2 bg-white dark:bg-dark-bg rounded-lg shadow-lg w-full border dark:border-gray-700">
                    {PRIVACY_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value as any);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-hover ${
                                value === opt.value
                                    ? 'bg-gray-200 dark:bg-dark-hover font-semibold text-black dark:text-white'
                                    : 'text-black dark:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center dark:text-white gap-2">
                                <span>{opt.icon}</span>
                                <span>{opt.label}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {opt.description}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
