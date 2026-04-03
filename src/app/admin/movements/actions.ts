'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMovement(prevState: any, formData: FormData) {
    const employee_id = formData.get('employee_id');
    if (!employee_id) {
        return { message: 'يرجى اختيار الموظف' };
    }

    try {
        await prisma.movement.create({
            data: {
                employee_id: Number(employee_id),
                type: formData.get('type') as string,
                decision_num: formData.get('decision_num') as string,
                decision_date: formData.get('decision_date') ? new Date(formData.get('decision_date') as string) : null,
                destination: formData.get('destination') as string,
                leave_date: formData.get('leave_date') ? new Date(formData.get('leave_date') as string) : null,
                resumption_date: formData.get('resumption_date') ? new Date(formData.get('resumption_date') as string) : null,
                end_decision_num: formData.get('end_decision_num') as string,
                end_decision_date: formData.get('end_decision_date') ? new Date(formData.get('end_decision_date') as string) : null,
                notes: formData.get('notes') as string,
            }
        });
    } catch (error) {
        console.error("Error creating movement:", error);
        return { message: 'حدث خطأ أثناء إضافة الحركة' };
    }

    revalidatePath('/admin/movements');
    redirect('/admin/movements');
}
