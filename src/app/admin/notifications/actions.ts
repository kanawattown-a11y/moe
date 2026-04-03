'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function markAsRead(id: number) {
    await (prisma as any).notification.update({
        where: { id },
        data: { is_read: true }
    });
    revalidatePath('/admin/notifications');
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;
    
    await (prisma as any).notification.updateMany({
        where: { user_id: Number(session.user.id), is_read: false },
        data: { is_read: true }
    });
    revalidatePath('/admin/notifications');
}

export async function deleteNotification(id: number) {
    await (prisma as any).notification.delete({
        where: { id }
    });
    revalidatePath('/admin/notifications');
}
