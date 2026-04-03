import { prisma } from './prisma';
import { auth } from '@/auth';

/**
 * Logs a sensitive action in the database for compliance and security.
 */
export async function auditLog(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT', resource: string, resourceId?: string | number, details?: any) {
    try {
        const session = await auth();
        const userId = session?.user?.id ? Number(session.user.id) : null;
        
        await (prisma as any).auditLog.create({
            data: {
                user_id: userId,
                action,
                resource,
                resource_id: resourceId?.toString(),
                details: details ? JSON.stringify(details) : undefined,
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}
