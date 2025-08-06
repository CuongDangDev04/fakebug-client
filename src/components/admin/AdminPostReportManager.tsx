'use client';

import { useEffect, useState } from 'react';
import { postService } from '@/services/postService';
import { PostReport } from '@/types/postReport';
import { toast } from 'sonner';
import Link from 'next/link';
import { AlertTriangle, ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, Ban } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { useUserStore } from '@/stores/userStore';

export default function AdminPostReportManager() {
  const [reports, setReports] = useState<PostReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const itemsPerPage = 10;
  const adminInfo = useUserStore(state => state.user);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await postService.getAllReportedPosts(page, itemsPerPage); // ← truyền page
      setReports(res.data);
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


  const handleResolve = async (reportId: number, action: 'remove' | 'ignore') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      const postId = report.post?.id;
      const postLink = `/bai-viet/${postId}`;
      const reporter = report.reporter;
      const reportedUser = report.reportedUser;

      if (action === 'remove') {
        await postService.approvePostReport(reportId);
        toast.success(' Bài viết đã bị gỡ');

        // Gửi thông báo
        await notificationService.sendNotification(
          reporter.id,
          `Báo cáo của bạn về bài viết đã được duyệt. Bài viết đã bị gỡ.`,
          postLink,
          '/lg.png'
        );

        await notificationService.sendNotification(
          reportedUser.id,
          `Bài viết của bạn đã bị gỡ do vi phạm chính sách.`,
          postLink,
          '/lg.png'
        );
      } else {
        await postService.rejectPostReport(reportId);
        toast.info(' Báo cáo đã được bỏ qua');

        // Gửi thông báo
        await notificationService.sendNotification(
          reporter.id,
          `Báo cáo của bạn về bài viết đã bị từ chối.`,
          postLink,
          '/lg.png'
        );

        await notificationService.sendNotification(
          reportedUser.id,
          `Bài viết của bạn đã được giữ lại sau khi xem xét báo cáo.`,
          postLink,
          '/lg.png'
        );
      }

      fetchReports(); // refresh lại danh sách
    } catch (err) {
      toast.error(' Xử lý báo cáo thất bại');
    }
  };

  if (!adminInfo) return null;

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
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-border shadow-md">
            <table className="min-w-full bg-white dark:bg-dark-card text-sm">
              <thead className="bg-gray-300 dark:bg-gray-800">
                <tr className="text-left text-gray-900 dark:text-dark-text-primary font-semibold">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Người báo cáo</th>
                  <th className="px-4 py-3">Người bị báo cáo</th>
                  <th className="px-4 py-3">Link bài viết</th>
                  <th className="px-4 py-3">Lý do</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {reports.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`transition ${r.status === 'pending'
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-hover'
                      }`}
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                      {(page - 1) * itemsPerPage + i + 1}
                    </td>

                    {/* Người báo cáo */}
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.reporter.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>
                          {r.reporter.first_name} {r.reporter.last_name}
                        </span>
                      </div>
                    </td>

                    {/* Người bị báo cáo */}
                    <td className="px-4 py-3 text-gray-800 dark:text-dark-text-primary">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.reportedUser.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>
                          {r.reportedUser.first_name} {r.reportedUser.last_name}
                        </span>
                      </div>
                    </td>

                    {/* Link bài viết */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/bai-viet/${r.post?.id}`}
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

                    {/* Trạng thái */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded font-medium ${r.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : r.status === 'removed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}
                      >
                        {{
                          pending: 'Đang chờ',
                          removed: 'Đã gỡ',
                          ignored: 'Đã bỏ qua',
                        }[r.status]}
                      </span>
                    </td>

                    {/* Thời gian */}
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-text-secondary">
                      {new Date(r.created_at).toLocaleString('vi-VN')}
                    </td>

                    {/* Hành động */}
                    <td className="px-4 py-3">
                      {r.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolve(r.id, 'remove')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                          >
                            <ShieldCheck size={14} /> Gỡ bài
                          </button>
                          <button
                            onClick={() => handleResolve(r.id, 'ignore')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                          >
                            <Ban size={14} /> Bỏ qua
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Đã xử lý</span>
                      )}
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
