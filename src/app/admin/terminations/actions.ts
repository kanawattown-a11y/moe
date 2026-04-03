'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTermination(prevState: any, formData: FormData) {
    const employee_id = formData.get('employee_id');
    if (!employee_id) {
        return { message: 'يرجى اختيار الموظف' };
    }

    try {
        await prisma.termination.create({
            data: {
                employee_id: Number(employee_id),
                type: formData.get('type') as string,
                decision_num: formData.get('decision_num') as string,
                decision_date: formData.get('decision_date') ? new Date(formData.get('decision_date') as string) : null,
                termination_date: formData.get('termination_date') ? new Date(formData.get('termination_date') as string) : null,
                transfer_to: formData.get('transfer_to') as string,
            }
        });

        // Optionally update the employee's status to 'Terminated' or equivalent
        // await prisma.employee.update({ ... })
    } catch (error) {
        console.error("Error creating termination:", error);
        return { message: 'حدث خطأ أثناء إضافة الحركة' };
    }

    revalidatePath('/admin/terminations');
    redirect('/admin/terminations');
}
