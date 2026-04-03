'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addVisaAudit(employeeId: number, formData: FormData) {
    try {
        const promotion_decision_name = formData.get('promotion_decision_name') as string;
        const promotion_decision_num = formData.get('promotion_decision_num') as string;
        const promotion_decision_date = formData.get('promotion_decision_date') ? new Date(formData.get('promotion_decision_date') as string) : null;

        const visa_decision_num = formData.get('visa_decision_num') as string;
        const visa_decision_date = formData.get('visa_decision_date') ? new Date(formData.get('visa_decision_date') as string) : null;

        const notes = formData.get('notes') as string;

        await prisma.visaAudit.create({
            data: {
                employee_id: employeeId,
                promotion_decision_name,
                promotion_decision_num,
                promotion_decision_date,
                visa_decision_num,
                visa_decision_date,
                notes,
                created_by: 'Admin'
            }
        });

        revalidatePath(`/admin/employees/${employeeId}`);
        return { success: true };
    } catch (error) {
        console.error('Error adding visa audit:', error);
        return { success: false, error: 'حدث خطأ أثناء الإضافة' };
    }
}
