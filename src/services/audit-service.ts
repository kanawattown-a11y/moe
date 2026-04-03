import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function createAuditLog({
    action,
    resource,
    resourceId,
    details
}: {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
    resource: string;
    resourceId?: string;
    details?: any;
}) {
    try {
        const session = await auth();
        const userId = session?.user?.id ? parseInt(session.user.id) : null;

        return await prisma.auditLog.create({
            data: {
                user_id: userId,
                action,
                resource,
                resource_id: resourceId,
                details: details ? JSON.parse(JSON.stringify(details)) : null
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

export async function getAuditLogs(limit = 100) {
    return await prisma.auditLog.findMany({
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: {
                    username: true,
                    role: true
                }
            }
        }
    });
}
