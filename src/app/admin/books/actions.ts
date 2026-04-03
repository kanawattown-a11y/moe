'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteBook(id: number) {
    try {
        await prisma.book.delete({
            where: { id }
        });

        revalidatePath('/admin/books');
        revalidatePath('/library');

        return { success: true };
    } catch (error) {
        console.error("Error deleting book:", error);
        return { success: false, error: 'حدث خطأ أثناء حذف الكتاب' };
    }
}
