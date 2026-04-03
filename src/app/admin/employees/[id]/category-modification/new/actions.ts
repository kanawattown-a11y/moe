'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCategoryModification(prevState: any, formData: FormData) {
    const employee_id = parseInt(formData.get('employee_id') as string);
    const current_job_category = formData.get('current_job_category') as string;
    const new_job_category_id = formData.get('new_job_category_id') as string;
    const new_job_title_id = formData.get('new_job_title_id') as string;
    const decision_number = formData.get('decision_number') as string;
    const decision_date = formData.get('decision_date') as string;

    const errors: any = {};

    if (!new_job_category_id || new_job_category_id.trim() === '') {
        errors.new_job_category_id = ['يرجى تحديد الفئة الوظيفية الجديدة'];
    }

    if (Object.keys(errors).length > 0) {
        return { message: 'يرجى تصحيح الأخطاء', errors };
    }

    try {
        await prisma.categoryModification.create({
            data: {
                employee_id,
                current_category_name: current_job_category ? current_job_category.trim() : null,
                new_category_id: parseInt(new_job_category_id, 10),
                new_job_title_id: new_job_title_id ? parseInt(new_job_title_id, 10) : null,
                decision_num: decision_number ? decision_number.trim() : null,
                decision_date: decision_date ? new Date(decision_date) : null,
                created_by: 'النظام'
            }
        });

        // Optionally update the employee's current job category and title record here if dictated by business logic
        // await prisma.employee.update({
        //     where: { id: employee_id },
        //     data: {
        //         job_category_id: parseInt(new_job_category_id, 10),
        //         job_title_current_id: new_job_title_id ? parseInt(new_job_title_id, 10) : undefined
        //     }
        // });

    } catch (error) {
        console.error("Failed to create category modification:", error);
        return { message: 'حدث خطأ غير متوقع أثناء الحفظ.', errors: {} as any };
    }

    revalidatePath(`/admin/employees/${employee_id}`);
    redirect(`/admin/employees/${employee_id}`);
}
