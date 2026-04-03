'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSalaryCeiling(prevState: any, formData: FormData) {
    const amountStr = formData.get('amount') as string;
    const categoryIdStr = formData.get('job_category_id') as string;

    const errors: any = {};
    if (!amountStr || amountStr.trim() === '') {
        errors.amount = ['يرجى إدخال السقف (المبلغ)'];
    }

    // Validate amount is a positive number
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
        errors.amount = ['الرجاء إدخال مبلغ صحيح'];
    }

    if (!categoryIdStr || categoryIdStr.trim() === '') {
        errors.job_category_id = ['الرجاء تحديد الفئة الوظيفية'];
    }

    if (Object.keys(errors).length > 0) {
        return { message: 'يرجى تصحيح الأخطاء التالية:', errors };
    }

    try {
        await prisma.salaryCeiling.create({
            data: {
                amount: amount,
                job_category_id: parseInt(categoryIdStr, 10)
            },
        });

        revalidatePath('/admin/settings/salary-ceilings');
        return { message: 'success', errors: {} };
    } catch (error) {
        console.error("Failed to create salary ceiling:", error);
        return { message: 'حدث خطأ أثناء الإضافة. تأكد من صحة البيانات المُدخلة.', errors: {} };
    }
}

export async function deleteSalaryCeiling(id: number) {
    try {
        await prisma.salaryCeiling.delete({
            where: { id },
        });
        revalidatePath('/admin/settings/salary-ceilings');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete salary ceiling:", error);
        return { success: false, message: 'لا يمكن حذف السقف، قد يكون مرتبطاً بجدول أجور بدء التعيين.' };
    }
}
