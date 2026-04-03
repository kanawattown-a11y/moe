import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/admin'); // Protected routes

            if (isOnDashboard) {
                if (!isLoggedIn) return false; // Redirect unauthenticated users to login page

                const user = auth.user as any;
                const path = nextUrl.pathname;

                if (user.role === 'ADMIN') return true;

                if (path.startsWith('/admin')) {
                    const restrictedPaths = [
                        '/admin/schools', '/admin/news', '/admin/settings', '/admin/users', '/admin/books',
                        '/admin/vacations', '/admin/promotions', '/admin/movements', '/admin/terminations'
                    ];
                    const matchingPath = restrictedPaths.find(p => path.startsWith(p));

                    if (matchingPath) {
                        const userPerms = user.permissions || [];
                        if (!userPerms.includes(matchingPath)) {
                            return Response.redirect(new URL('/admin', nextUrl));
                        }
                    }
                }

                return true;
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login page
                if (nextUrl.pathname.startsWith('/login')) {
                    return Response.redirect(new URL('/admin/employees', nextUrl));
                }
            }
            return true;
        },
        jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.permissions = user.permissions;
                token.employee_id = user.employee_id;
            }
            return token;
        },
        session({ session, token }: any) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.permissions = token.permissions as string[];
                session.user.employee_id = token.employee_id as number;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
