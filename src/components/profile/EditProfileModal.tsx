'use client'

import { useState } from 'react'
import EditProfileForm from './EditProfileForm'
import type { UpdateUserProfilePayload } from '@/types/user'
import { UserRoundPen } from 'lucide-react'

interface Props {
    initialData: UpdateUserProfilePayload
    onUpdated?: () => void
}

export default function EditProfileModal({ initialData, onUpdated }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-md transition"
            >
                <UserRoundPen className="w-4 h-4" />
                <span>Chỉnh sửa thông tin cá nhân</span>
            </button>


            {/* Modal backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    {/* Modal content */}
                    <div className="bg-white dark:bg-dark-card rounded-xl p-6 max-w-xl w-full shadow-lg relative animate-fadeIn">
                        {/* Nút đóng modal */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>

                        <EditProfileForm
                            initialData={initialData}
                            onUpdated={() => {
                                setIsOpen(false)
                                onUpdated?.()
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
