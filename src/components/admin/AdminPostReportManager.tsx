'use client';

import { useEffect, useState } from 'react';
import { postService } from '@/services/postService';
import { PostReport } from '@/types/postReport';
import { toast } from 'sonner';
import Link from 'next/link';
import { AlertTriangle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function AdminPostReportManager() {
  const [reports, setReports] = useState<PostReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const itemsPerPage = 10;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await postService.getAllReportedPosts((page - 1) * itemsPerPage, itemsPerPage);
      setReports(res.data); // API trả về { data, total }
      setTotalReports(res.total);
    } catch (err) {
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const totalPages = Math.ceil(totalReports / itemsPerPage);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          Quản lý báo cáo bài viết
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 animate-pulse">
          Đang tải danh sách báo cáo...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
            <table className="min-w-full bg-white dark:bg-gray-900 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr className="text-left text-gray-700 dark:text-gray-300 font-semibold">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Người báo cáo</th>
                  <th className="px-4 py-3">Người bị báo cáo</th>
                  <th className="px-4 py-3">Link bài viết</th>
                  <th className="px-4 py-3">Lý do</th>
                  <th className="px-4 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {reports.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3">{(page - 1) * itemsPerPage + i + 1}</td>

                    {/* Người báo cáo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.reporter.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{r.reporter.first_name} {r.reporter.last_name}</span>
                      </div>
                    </td>

                    {/* Người bị báo cáo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.reportedUser.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{r.reportedUser.first_name} {r.reportedUser.last_name}</span>
                      </div>
                    </td>

                    {/* Link bài viết */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/bai-viet/${r.post.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        target="_blank"
                      >
                        Xem bài viết <ExternalLink size={14} />
                      </Link>
                    </td>

                    {/* Lý do */}
                    <td className="px-4 py-3 text-red-700 dark:text-red-400 font-medium">
                      <AlertTriangle size={14} className="inline mr-1" /> {r.reason}
                    </td>

                    {/* Thời gian */}
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(r.created_at).toLocaleString('vi-VN')}
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
              Trang {page} / {totalPages || 1}
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
