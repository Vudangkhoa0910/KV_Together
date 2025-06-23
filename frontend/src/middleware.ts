import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const user = request.cookies.get('user');
    const path = request.nextUrl.pathname;
    
    // Handle auth-related routes
    if (path.startsWith('/auth/')) {
        // For login and register pages
        if (path === '/auth/login' || path === '/auth/register') {
            if (user) {
                return NextResponse.redirect(new URL('/', request.url));
            }
            return NextResponse.next();
        }
        
        // Allow other auth-related routes to pass through
        return NextResponse.next();
    }

    // Protected routes
    if (path.startsWith('/admin') || path.startsWith('/staff') || path.startsWith('/user')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            const userData = JSON.parse(user.value);
            // Handle different user data structures
            const userRole = userData.role?.slug || userData.user?.role?.slug;

            if (!userRole) {
                console.error('No user role found in middleware:', userData);
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }

            // Check role-based access
            if (path.startsWith('/admin') && userRole !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url));
            }
            if (path.startsWith('/staff') && userRole !== 'staff') {
                return NextResponse.redirect(new URL('/', request.url));
            }
            if (path.startsWith('/user') && !['user', 'fundraiser'].includes(userRole)) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (error) {
            console.error('Error parsing user data in middleware:', error);
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Handle fundraiser routes
    if (path.startsWith('/fundraiser')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            const userData = JSON.parse(user.value);
            const userRole = userData.role?.slug || userData.user?.role?.slug;

            if (userRole !== 'fundraiser') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Check if fundraiser is verified (if needed)
            // You can add verification status check here if required
        } catch (error) {
            console.error('Error parsing user data for fundraiser routes:', error);
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/auth/login',
        '/auth/register', 
        '/auth/:path*',
        '/admin/:path*',
        '/staff/:path*',
        '/user/:path*',
        '/fundraiser/:path*',
    ],
}; 