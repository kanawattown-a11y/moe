import { prisma } from './prisma';

/**
 * Creates a notification for a specific user.
 */
export async function notify(userId: number, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
        await (prisma as any).notification.create({
            data: {
                user_id: userId,
                title,
                message,
                type
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

/**
 * Helper to notify multiple users (e.g. all admins).
 */
export async function notifyAdmins(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', is_active: true }
        });
        
        await Promise.all(admins.map(admin => notify(admin.id, title, message, type)));
    } catch (error) {
        console.error('Failed to notify admins:', error);
    }
}
