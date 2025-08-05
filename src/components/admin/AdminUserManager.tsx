'use client';

import { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import Switch from '../common/ui/Switch';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  is_disabled: boolean;
  role: 'user' | 'admin';
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    const res = await userService.getUsersByRole('user', page);
    setUsers(res.users);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  const handleToggleStatus = async (userId: number, disable: boolean) => {
    try {
      await userService.toggleUserStatus(userId, disable);
      toast.success(disable ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt lại tài khoản');
      fetchUsers(page);
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          Quản lý người dùng
        </h2>
      
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 animate-pulse">Đang tải danh sách người dùng...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
            <table className="min-w-full bg-white dark:bg-gray-900 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr className="text-left text-gray-700 dark:text-gray-300 font-semibold">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">
                      <img
                        src={u.avatar_url}
                        alt={u.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-400 transition-shadow"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">({u.username})</div>
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.is_disabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-300">
                          <XCircle size={14} /> Vô hiệu hóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-300">
                          <CheckCircle size={14} /> Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={!u.is_disabled}
                        onCheckedChange={(checked) => handleToggleStatus(u.id, !checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-100">
              Trang {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
