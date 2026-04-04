'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPromotion(prevState: any, formData: FormData) {
    const employee_id = formData.get('employee_id');
    if (!employee_id) {
        return { message: 'يرجى اختيار الموظف' };
    }

    try {
        await prisma.promotion.create({
            data: {
                employee_id: Number(employee_id),
                salary_before: formData.get('salary_before') ? Number(formData.get('salary_before')) : null,
                salary_after: formData.get('salary_after') ? Number(formData.get('salary_after')) : null,
                competence_degree: formData.get('efficiency_grade') ? Number(formData.get('efficiency_grade')) : null,
                allowance_percent: formData.get('raise_percentage') ? Number(formData.get('raise_percentage')) : null,
                allowance_amount: formData.get('raise_amount') ? Number(formData.get('raise_amount')) : null,
                duration: formData.get('duration') ? Number(formData.get('duration')) : null,
                current_date: formData.get('current_date') ? new Date(formData.get('current_date') as string) : null,
                notes: formData.get('notes') as string,
            }
        });
    } catch (error) {
        console.error("Error creating promotion:", error);
        return { message: 'حدث خطأ أثناء إضافة الترفيع' };
    }

    revalidatePath('/admin/promotions');
    redirect('/admin/promotions');
}
