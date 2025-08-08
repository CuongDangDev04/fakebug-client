'use client'

import { userService } from '@/services/userService'
import { userReportService } from '@/services/userReportService'
import { postService } from '@/services/postService'
import { Users, AlertTriangle, Flag } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#FFBB28', '#00C49F', '#FF8042']

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number>(0)
  const [userReports, setUserReports] = useState<number>(0)
  const [postReports, setPostReports] = useState<number>(0)

  const [postReportStatusData, setPostReportStatusData] = useState([
    { status: 'Chờ xử lý', key: 'pending', count: 0 },
    { status: 'Đã xóa', key: 'removed', count: 0 },
    { status: 'Bị bỏ qua', key: 'ignored', count: 0 },
  ])

  const [postsPrivacyData, setPostsPrivacyData] = useState([
    { privacy: 'Công khai', key: 'public', count: 0 },
    { privacy: 'Bạn bè', key: 'friends', count: 0 },
    { privacy: 'Riêng tư', key: 'private', count: 0 },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const count = await userService.countUsers()
        setUserCount(count)
      } catch {
        setUserCount(0)
      }

      try {
        const pendingReports = await userReportService.countPendingReports()
        setUserReports(pendingReports)
      } catch {
        setUserReports(0)
      }

      try {
        const pendingPostReports = await postService.getCountPendingReports()
        setPostReports(pendingPostReports.count ?? 0)
      } catch {
        setPostReports(0)
      }

      try {
        const reportStatusJson = await postService.getReportStatusCount()
        setPostReportStatusData([
          { status: 'Chờ xử lý', key: 'pending', count: reportStatusJson.pending || 0 },
          { status: 'Đã xóa', key: 'removed', count: reportStatusJson.removed || 0 },
          { status: 'Bị bỏ qua', key: 'ignored', count: reportStatusJson.ignored || 0 },
        ])
      } catch {
        setPostReportStatusData([
          { status: 'Chờ xử lý', key: 'pending', count: 0 },
          { status: 'Đã xóa', key: 'removed', count: 0 },
          { status: 'Bị bỏ qua', key: 'ignored', count: 0 },
        ])
      }

      try {
        const postsPrivacyJson = await postService.getPostsPrivacyCount()
        setPostsPrivacyData([
          { privacy: 'Công khai', key: 'public', count: postsPrivacyJson.public || 0 },
          { privacy: 'Bạn bè', key: 'friends', count: postsPrivacyJson.friends || 0 },
          { privacy: 'Riêng tư', key: 'private', count: postsPrivacyJson.private || 0 },
        ])
      } catch {
        setPostsPrivacyData([
          { privacy: 'Công khai', key: 'public', count: 0 },
          { privacy: 'Bạn bè', key: 'friends', count: 0 },
          { privacy: 'Riêng tư', key: 'private', count: 0 },
        ])
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-6 bg-gray-50 dark:bg-dark-bg ">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Cards thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 flex items-center gap-4">
          <Users className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Tổng người dùng
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{userCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 flex items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Báo cáo người dùng chưa xử lý
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{userReports}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6 flex items-center gap-4">
          <Flag className="w-10 h-10 text-red-500 dark:text-red-400" />
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Báo cáo bài viết chưa xử lý
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{postReports}</p>
          </div>
        </div>
      </div>

      {/* Thống kê chi tiết */}
      <section className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Thống kê chi tiết
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Biểu đồ báo cáo bài viết theo trạng thái */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Báo cáo bài viết theo trạng thái
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={postReportStatusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ bài viết theo loại privacy */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Số bài viết theo loại quyền riêng tư
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={postsPrivacyData}
                  dataKey="count"
                  nameKey="privacy"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {postsPrivacyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}
