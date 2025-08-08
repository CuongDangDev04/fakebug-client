import api from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/user-report`;

export const userReportService = {
    // Gửi báo cáo người dùng
    async reportUser(reportedUserId: number, reporterId: number, reason: string) {
        try {
            const response = await api.post(`${BASE_URL}/${reportedUserId}`, {
                reporterId,
                reason,
            });
            return response.data;
        } catch (error: any) {
            console.error('Lỗi khi báo cáo người dùng:', error);
            throw error;
        }
    },

    // Lấy danh sách báo cáo (admin)
    async getAllReports() {
        try {
            const response = await api.get(BASE_URL);
            return response.data;
        } catch (error: any) {
            console.error('Lỗi khi lấy danh sách báo cáo:', error);
            throw error;
        }
    },

    // Cập nhật trạng thái báo cáo (admin)
    async updateReportStatus(reportId: number, status: 'pending' | 'reviewed' | 'dismissed') {
        try {
            const response = await api.patch(`${BASE_URL}/${reportId}`, { status });
            return response.data;
        } catch (error: any) {
            console.error('Lỗi khi cập nhật trạng thái báo cáo:', error);
            throw error;
        }
    },
};
