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
        await prisma.transferOrLoan.create({
            data: {
                employee_id: parseInt(formData.get('employee_id') as string),
                action_type: formData.get('type') as string,
                decision_num: formData.get('decision_num') as string,
                entity: formData.get('destination') as string,
                start_date: formData.get('leave_date') ? new Date(formData.get('leave_date') as string) : null,
                return_date: formData.get('resumption_date') ? new Date(formData.get('resumption_date') as string) : null,
            }
        });
    } catch (error) {
        console.error("Error creating movement:", error);
        return { message: 'حدث خطأ أثناء إضافة الحركة' };
    }

    revalidatePath('/admin/movements');
    redirect('/admin/movements');
}
