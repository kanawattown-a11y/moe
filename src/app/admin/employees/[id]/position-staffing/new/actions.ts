'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPositionStaffing(prevState: any, formData: FormData) {
    const employee_id = parseInt(formData.get('employee_id') as string);
    const appointment_type = formData.get('appointment_type') as string;
    const decision_number = formData.get('decision_number') as string;
    const decision_date = formData.get('decision_date') as string;
    const notes = formData.get('notes') as string;

    const errors: any = {};

    if (!appointment_type || appointment_type.trim() === '') {
        errors.appointment_type = ['يرجى إدخال نمط التعيين'];
    }

    if (Object.keys(errors).length > 0) {
        return { message: 'يرجى تصحيح الأخطاء', errors };
    }

    try {
        await prisma.positionStaffing.create({
            data: {
                employee_id,
                appointment_type: appointment_type.trim(),
                decision_number: decision_number ? decision_number.trim() : null,
                decision_date: decision_date ? new Date(decision_date) : null,
                notes: notes ? notes.trim() : null,
                created_by: 'النظام' // Or get from session
            }
        });
    } catch (error) {
        console.error("Error creating Position Staffing:", error);
        return { message: 'حدث خطأ غير متوقع أثناء الحفظ', errors: {} as any };
    }

    revalidatePath(`/admin/employees/${employee_id}`);
    redirect(`/admin/employees/${employee_id}`);
}
