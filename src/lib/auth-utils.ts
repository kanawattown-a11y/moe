import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function checkAuth(allowedRoles?: string[]) {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/login');
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role as string)) {
        // If they are not authorized for this specific action/page
        // We could redirect to a 403 page or just back to admin
        redirect('/admin?error=Unauthorized');
    }

    return session;
}
