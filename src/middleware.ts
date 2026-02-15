import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/token';

const protectedPaths = ['/chat', '/documents', '/tools'];
const authPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(COOKIE_NAME)?.value;
    const user = token ? await verifyToken(token) : null;

    // Redirect authenticated users away from auth pages
    if (authPaths.some((p) => pathname.startsWith(p)) && user) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Protect authenticated routes
    if (protectedPaths.some((p) => pathname.startsWith(p)) && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/chat/:path*', '/documents/:path*', '/tools/:path*', '/login', '/signup'],
};
