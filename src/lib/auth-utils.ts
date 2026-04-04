import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export interface UserSession {
    user: {
        id: string;
        name?: string;
        role: string;
        employee_id?: number | null;
        permissions?: string[] | null;
    }
}

/**
 * Checks if the user is an Admin or Employee Management role.
 */
export function isManager(session: UserSession | null): boolean {
    if (!session) return false;
    return session.user.role === 'ADMIN' || session.user.role === 'EMPLOYEE';
}

/**
 * Verifies if the session user has permissions for a specific employee ID.
 * Managers have global access. Others only have access to their own linked ID.
 */
export function verifyOwnership(session: UserSession | null, targetEmployeeId: number | string): boolean {
    if (!session) return false;
    if (isManager(session)) return true;
    
    const sessionEmployeeId = session.user.employee_id;
    if (!sessionEmployeeId) return false;
    
    return String(sessionEmployeeId) === String(targetEmployeeId);
}

/**
 * Robust authentication check with role-based filtering
 */
export async function checkAuth(allowedRoles?: string[]) {
    const session = await auth() as UserSession | null;

    if (!session || !session.user) {
        redirect('/login');
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        redirect('/admin?error=Unauthorized');
    }

    return session;
}

/**
 * Custom Permission Check
 * Admin has access to everything.
 * Employees have access based on their assigned permissions array.
 */
export function hasPermission(session: UserSession | null, modulePath: string) {
    if (!session?.user) return false;
    if (session.user.role === 'ADMIN') return true;

    // Check custom permissions list
    const perms = session.user.permissions;
    if (Array.isArray(perms) && perms.includes(modulePath)) return true;

    // Default: Teachers only get dashboard/notifications
    const publicPaths = ['/admin', '/admin/notifications'];
    return publicPaths.includes(modulePath);
}

/**
 * Isolation Filter:
 * Returns a Prisma 'where' clause that restricts data to the user's own record 
 * if they are not an authorized manager for that module.
 */
export function getAccessFilter(session: UserSession | null, skipManagerCheck = false) {
    if (!session?.user) return { id: -1 }; // Deny by default

    // If skipManagerCheck is true, it means even managers see their own data (e.g. personal profile)
    if (!skipManagerCheck && isManager(session)) {
        return {}; // No filter, see all
    }

    // Force filter by linked employee ID
    const empId = session.user.employee_id;
    return empId ? { employee_id: empId } : { id: -1 }; // If not linked, deny
}

/**
 * Same as getAccessFilter but for the Employee model directly (uses 'id' instead of 'employee_id')
 */
export function getEmployeeAccessFilter(session: UserSession | null) {
    if (!session?.user) return { id: -1 };
    if (isManager(session)) return {};
    const empId = session.user.employee_id;
    return empId ? { id: empId } : { id: -1 };
}
