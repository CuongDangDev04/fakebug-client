'use client'

import { useState } from 'react'
import { userService } from '@/services/userService'
import type { UpdateUserProfilePayload } from '@/types/user'
import { toast } from 'sonner'

interface Props {
    initialData: UpdateUserProfilePayload
    onUpdated?: () => void // callback để reload lại profile
}

export default function EditProfileForm({ initialData, onUpdated }: Props) {
    const [formData, setFormData] = useState<UpdateUserProfilePayload>(initialData)
    const [loading, setLoading] = useState(false)

    const handleChange = (field: keyof UpdateUserProfilePayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            await userService.updateProfile(formData)
            toast.success('Cập nhật thành công')
            onUpdated?.()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Cập nhật thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl p-4 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold dark:text-white">Chỉnh sửa thông tin</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Họ</label>
                    <input
                        type="text"
                        value={formData.first_name || ''}
                        onChange={handleChange('first_name')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-black dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Tên</label>
                    <input
                        type="text"
                        value={formData.last_name || ''}
                        onChange={handleChange('last_name')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-black dark:text-white"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <input
                        type="text"
                        value={formData.username || ''}
                        onChange={handleChange('username')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-black dark:text-white"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Giới thiệu</label>
                    <textarea
                        value={formData.bio || ''}
                        onChange={handleChange('bio')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-bg text-black dark:text-white"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-50"
                >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </div>
    )
}
