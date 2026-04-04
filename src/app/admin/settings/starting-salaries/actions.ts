'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createStartingSalary(prevState: any, formData: FormData) {
    const amountStr = formData.get('amount') as string;
    const appointment_capacity = formData.get('appointment_capacity') as string;
    const categoryIdStr = formData.get('job_category_id') as string;
    const ceilingIdStr = formData.get('salary_ceiling_id') as string;

    const errors: any = {};
    if (!amountStr || amountStr.trim() === '') {
        errors.amount = ['يرجى إدخال مبلغ الأجر'];
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
        errors.amount = ['الرجاء إدخال مبلغ صحيح'];
    }

    if (Object.keys(errors).length > 0) {
        return { message: 'يرجى تصحيح الأخطاء التالية:', errors };
    }

    try {
        await prisma.startingSalary.create({
            data: {
                starting_salary: amount,
                appointment_attr: appointment_capacity?.trim() || null,
                job_category_id: categoryIdStr ? parseInt(categoryIdStr, 10) : null,
                ceiling_id: ceilingIdStr ? parseInt(ceilingIdStr, 10) : null
            },
        });

        revalidatePath('/admin/settings/starting-salaries');
        return { message: 'success', errors: {} };
    } catch (error) {
        console.error("Failed to create starting salary:", error);
        return { message: 'حدث خطأ أثناء الإضافة. تأكد من صحة البيانات المُدخلة.', errors: {} };
    }
}

export async function deleteStartingSalary(id: number) {
    try {
        await prisma.startingSalary.delete({
            where: { id },
        });
        revalidatePath('/admin/settings/starting-salaries');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete starting salary:", error);
        return { success: false, message: 'لا يمكن حذف أجر بدء التعيين، قد يكون مرتبطاً ببيانات موظفين.' };
    }
}
