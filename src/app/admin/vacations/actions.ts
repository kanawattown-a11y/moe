'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createVacation(prevState: any, formData: FormData) {
    const employee_id = formData.get('employee_id');
    if (!employee_id) {
        return { message: 'يرجى اختيار الموظف' };
    }

    try {
        await prisma.leaveRequest.create({
            data: {
                employee_id: Number(employee_id),
                leave_type: formData.get('type') as string,
                decision_num: formData.get('decision_num') as string,
                start_date: formData.get('start_date') ? new Date(formData.get('start_date') as string) : null,
                end_date: formData.get('end_date') ? new Date(formData.get('end_date') as string) : null,
                duration: formData.get('duration') ? Number(formData.get('duration')) : null,
                notes: formData.get('notes') as string,
            }
        });
    } catch (error) {
        console.error("Error creating vacation:", error);
        return { message: 'حدث خطأ أثناء إضافة الإجازة' };
    }

    revalidatePath('/admin/vacations');
    redirect('/admin/vacations');
}
