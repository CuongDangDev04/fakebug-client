// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_FILE = /\.(.*)$/;
const ADMIN_PATH = '/admin';
const PUBLIC_ROUTES = ['/dang-nhap', '/dang-ky', '/quen-mat-khau', '/doi-mat-khau', '/google/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua file tĩnh, API và public route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname) ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret');
    const { payload } = await jwtVerify(token, secret);

    // Nếu là trang admin thì kiểm tra quyền admin
    if (pathname.startsWith(ADMIN_PATH) && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Cho phép truy cập
    return NextResponse.next();
  } catch (err) {
    console.error('Lỗi xác thực JWT:', err);
    return NextResponse.redirect(new URL('/dang-nhap', request.url));
  }
}

// Cấu hình matcher nếu muốn hạn chế middleware chạy trên toàn bộ site:
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
