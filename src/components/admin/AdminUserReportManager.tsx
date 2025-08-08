'use client';

import { useEffect, useState } from 'react';
import { userReportService } from '@/services/userReportService';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ShieldCheck, Ban, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { ReportStatus } from '@/types/userReport';
import { notificationService } from '@/services/notificationService';

export default function AdminUserReportManager() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const itemsPerPage = 10;
    const adminInfo = useUserStore(state => state.user);
    const statusLabels: Record<ReportStatus, string> = {
        pending: "Chờ xử lý",
        reviewed: "Đã xem xét",
        dismissed: "Bỏ qua",
    };
    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await userReportService.getAllReports();
            setReports(res || []);
            setTotalReports(res?.length || 0);
        } catch (err) {
            toast.error('Không thể tải danh sách báo cáo người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    const handleUpdateStatus = async (
        reportId: number,
        status: 'pending' | 'reviewed' | 'dismissed'
    ) => {
        console.log('[FE] Bắt đầu handleUpdateStatus với:', { reportId, status });

        try {
            const updatedReport = await userReportService.updateReportStatus(reportId, status);
            console.log('[FE] Kết quả updateReportStatus:', updatedReport);

            if (status === 'reviewed') {
                toast.success('Báo cáo đã được duyệt');

                console.log('[FE] Gửi thông báo cho người bị báo cáo:', updatedReport.reportedUser);
                await notificationService.sendNotification(
                    updatedReport.reportedUser.id,
                    'Tài khoản của bạn đã bị khóa 1 ngày do vi phạm nội quy.',
                    `/profile/${updatedReport.reportedUser.id}`,
                    '/lg.png'
                );

                console.log('[FE] Gửi thông báo cho người báo cáo:', updatedReport.reporter);
                await notificationService.sendNotification(
                    updatedReport.reporter.id,
                    `Báo cáo của bạn về người dùng ${updatedReport.reportedUser.first_name} ${updatedReport.reportedUser.last_name} đã được duyệt và tài khoản người dùng ${updatedReport.reportedUser.first_name} ${updatedReport.reportedUser.last_name} bị khoá 1 ngày.`,
                    `/profile/${updatedReport.reportedUser.id}`,
                    '/lg.png'

                );
            }
            else if (status === 'dismissed') {
                toast.info('Báo cáo đã được bỏ qua');
            }

            console.log('[FE] Gọi fetchReports để tải lại danh sách báo cáo');
            fetchReports();
        } catch (err) {
            console.error('[FE] Lỗi khi cập nhật trạng thái:', err);
            toast.error('Cập nhật trạng thái thất bại');
        }
    };



    if (!adminInfo) return null;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    Quản lý báo cáo người dùng
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
                                    <th className="px-4 py-3">Lý do</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Thời gian</th>
                                    <th className="px-4 py-3">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                                {reports
                                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                                    .map((r, i) => (
                                        <tr
                                            key={r.id}
                                            className={`transition ${r.status === 'pending'
                                                ? 'bg-gray-100 dark:bg-gray-800'
                                                : 'hover:bg-gray-50 dark:hover:bg-dark-hover'
                                                }`}
                                        >
                                            <td className="px-4 py-3">{(page - 1) * itemsPerPage + i + 1}</td>

                                            {/* Người báo cáo */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={r.reporter.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                                                    <span>{r.reporter.first_name} {r.reporter.last_name}</span>
                                                </div>
                                            </td>

                                            {/* Người bị báo cáo */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={r.reportedUser.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                                                    <span>{r.reportedUser.first_name} {r.reportedUser.last_name}</span>
                                                </div>
                                            </td>

                                            {/* Lý do */}
                                            <td className="px-4 py-3 text-red-700 dark:text-red-400 font-medium">
                                                <AlertTriangle size={14} className="inline mr-1" /> {r.reason}
                                            </td>

                                            {/* Trạng thái */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-block px-2 py-1 text-xs rounded font-medium ${r.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                        : r.status === "reviewed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {statusLabels[r.status as ReportStatus]}
                                                </span>
                                            </td>

                                            {/* Thời gian */}
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(r.created_at).toLocaleString('vi-VN')}
                                            </td>

                                            {/* Hành động */}
                                            <td className="px-4 py-3">
                                                {r.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(r.id, 'reviewed')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                                                        >
                                                            <ShieldCheck size={14} /> Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(r.id, 'dismissed')}
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
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                            Trang {page} / {totalPages || 1}
                        </span>
                        <button
                            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
