'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addWeeklyQuota(employeeId: number, formData: FormData) {
    try {
        const complex_id = formData.get('educational_complex_id');
        const school_id = formData.get('school_id');
        const hours = formData.get('hours');
        const is_additional = formData.get('is_additional') === 'on';

        await prisma.weeklyQuota.create({
            data: {
                employee_id: employeeId,
                complex_id: complex_id ? parseInt(complex_id as string) : null,
                school_id: school_id ? parseInt(school_id as string) : null,
                hours: hours ? parseInt(hours as string) : null,
                is_additional,
            }
        });

        revalidatePath(`/admin/employees/${employeeId}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding weekly quota:', error);
        return { success: false, error: 'حدث خطأ أثناء الإضافة' };
    }
}
