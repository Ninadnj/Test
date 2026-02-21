import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
    // Edge-compatible session retrieval without Prisma
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const isLoggedIn = !!token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/auth') && isLoggedIn) {
        return NextResponse.redirect(new URL("/search", req.url));
    }

    // Protect all internal routes that are not public apis or public assets
    if (!isLoggedIn && !pathname.startsWith('/auth') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
