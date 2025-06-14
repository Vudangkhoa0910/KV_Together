import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const user = request.cookies.get('user');
    const path = request.nextUrl.pathname;

    // Public routes
    if (path === '/login' || path === '/register') {
        if (user) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Protected routes
    if (path.startsWith('/admin') || path.startsWith('/staff') || path.startsWith('/user')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const userData = JSON.parse(user.value);
        const userRole = userData.user.role.slug;

        // Check role-based access
        if (path.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (path.startsWith('/staff') && userRole !== 'staff') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (path.startsWith('/user') && userRole !== 'user') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Get the user's session token from cookies
    const session = request.cookies.get('session')?.value;

    // Check if the request is for a protected route
    if (path.startsWith('/fundraiser') || path.startsWith('/user')) {
        if (!session) {
            // Redirect to login if no session exists
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Verify the session and check user role
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${session}`
                }
            });

            if (!response.ok) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            const data = await response.json();
            
            // Handle fundraiser routes
            if (path.startsWith('/fundraiser')) {
                // Check if user is a fundraiser
                if (data.user.role !== 'fundraiser') {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }

                // Check if fundraiser is verified
                if (data.user.verification_status !== 'verified') {
                    return NextResponse.redirect(new URL('/fundraiser/pending', request.url));
                }
            }

            // Handle user routes
            if (path.startsWith('/user')) {
                // Allow both regular users and fundraisers to access user routes
                if (!['user', 'fundraiser'].includes(data.user.role)) {
                    return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
            }
        } catch (error) {
            console.error('Error verifying session:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/admin/:path*',
        '/staff/:path*',
        '/user/:path*',
        '/fundraiser/:path*',
    ],
}; 