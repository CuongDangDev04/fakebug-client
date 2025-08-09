# Social Network Client

Đây là frontend của dự án **Social Network**, được xây dựng bằng [Next.js](https://nextjs.org). Dự án cung cấp giao diện người dùng cho một mạng xã hội với các chức năng như đăng ký, đăng nhập, đăng nhập bằng Google, đăng bài, kết bạn, nhắn tin, bình luận, và nhiều tính năng khác.

🚀 **Demo:** [https://fakebug.vercel.app/](https://fakebug.vercel.app/)

## Chức năng chính

- Đăng ký, đăng nhập, đăng nhập google, xác thực người dùng
- Quản lý hồ sơ cá nhân (profile)
- Đăng bài viết, hình ảnh, video
- Bình luận, thích (like), chia sẻ bài viết
- Kết bạn, quản lý danh sách bạn bè
- Nhắn tin trực tiếp (chat real-time) dùng thư viện socket.io
- Call audio, video dùng WebRTC 
- Thông báo (notifications) realtime dùng thư viện socket.io
- Tìm kiếm người dùng, bài viết
- Responsive UI, tối ưu cho cả desktop và mobile

## Cấu trúc thư mục

- `app/` - Các trang chính của ứng dụng (Next.js App Router)
- `components/` - Các component dùng chung
- `hooks/` - Custom React hooks
- `public/` - Ảnh, icon, tài nguyên tĩnh
- `stores/` - Store dùng thư viện Zustand để quản lí state toàn cục 
- `services/` - Gọi api Backend, cấu hình api
- `types/` - Định nghĩa kiểu dữ liệu TypeScript
- `utils/` - Các hàm tiện ích

## Yêu cầu

- Node.js >= 18
- Kết nối với backend (API) của dự án Social Network (xem hướng dẫn backend ở repo khác)

## Hướng dẫn chạy dự án

1. **Cài đặt dependencies:**

   ```bash
   npm install
   # hoặc
   yarn install
   # hoặc
   pnpm install
   ```

2. **Cấu hình biến môi trường:**

   Tạo file `.env` dựa trên file mẫu `.env.example` (nếu có), cấu hình các biến như API endpoint, v.v.

3. **Chạy server phát triển:**

   ```bash
   npm run dev
   # hoặc
   yarn dev
   # hoặc
   pnpm dev
   # hoặc
   bun dev
   ```

   Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

4. **Build production:**

   ```bash
   npm run build
   npm start
   ```

## Lưu ý

- Đây chỉ là phần frontend, cần chạy backend song song để sử dụng đầy đủ chức năng.

## Tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Vercel Deployment](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

---
