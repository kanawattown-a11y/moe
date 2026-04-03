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
        await prisma.vacation.create({
            data: {
                employee_id: Number(employee_id),
                type: formData.get('type') as string,
                decision_num: formData.get('decision_num') as string,
                start_date: formData.get('start_date') ? new Date(formData.get('start_date') as string) : null,
                end_date: formData.get('end_date') ? new Date(formData.get('end_date') as string) : null,
                duration: formData.get('duration') ? Number(formData.get('duration')) : null,
                interruption_decision_num: formData.get('interruption_decision_num') as string,
                interruption_date: formData.get('interruption_date') ? new Date(formData.get('interruption_date') as string) : null,
                actual_start_date: formData.get('actual_start_date') ? new Date(formData.get('actual_start_date') as string) : null,
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
