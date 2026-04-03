'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SchoolSchema = z.object({
    name: z.string().min(3, { message: 'اسم المدرسة يجب أن يكون 3 أحرف على الأقل' }),
    stat_num: z.coerce.number().optional(),
    city_id: z.coerce.number().min(1, { message: 'يرجى اختيار المدينة' }),
    village_id: z.coerce.number().optional(),
    stage: z.string().optional(),
    phone: z.string().optional(),
    education_type: z.string().optional(),
})

export async function updateSchool(schoolId: number, prevState: any, formData: FormData) {
    const validatedFields = SchoolSchema.safeParse({
        name: formData.get('name'),
        stat_num: formData.get('stat_num'),
        city_id: formData.get('city_id'),
        village_id: formData.get('village_id'),
        stage: formData.get('stage'),
        phone: formData.get('phone'),
        education_type: formData.get('education_type'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'البيانات غير مكتملة.',
        }
    }

    const { name, stat_num, city_id, village_id, stage, phone, education_type } = validatedFields.data

    try {
        await prisma.school.update({
            where: { id: schoolId },
            data: {
                name,
                stat_num,
                city_id,
                village_id: village_id || null,
                stage,
                phone,
                education_type,
            },
        })
    } catch (error) {
        console.error(error);
        return {
            message: 'حدث خطأ أثناء تحديث المدرسة.',
        }
    }

    revalidatePath('/admin/schools');
    redirect('/admin/schools');
}

export async function createSchool(prevState: any, formData: FormData) {
    const validatedFields = SchoolSchema.safeParse({
        name: formData.get('name'),
        stat_num: formData.get('stat_num'),
        city_id: formData.get('city_id'),
        village_id: formData.get('village_id'),
        stage: formData.get('stage'),
        phone: formData.get('phone'),
        education_type: formData.get('education_type'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'البيانات غير مكتملة.',
        };
    }

    const { name, stat_num, city_id, village_id, stage, phone, education_type } = validatedFields.data;

    try {
        await prisma.school.create({
            data: {
                name,
                stat_num,
                city_id,
                village_id: village_id || null,
                stage,
                phone,
                education_type,
            },
        });
    } catch (error) {
        console.error(error);
        return {
            message: 'حدث خطأ أثناء إضافة المدرسة.',
        };
    }

    revalidatePath('/admin/schools');
    redirect('/admin/schools');
}

export async function deleteSchool(id: number) {
    try {
        await prisma.school.delete({
            where: { id },
        });
        revalidatePath('/admin/schools');
        return { message: 'تم حذف المدرسة بنجاح' };
    } catch (error) {
        console.error('Failed to delete school:', error);
        return { message: 'حدث خطأ أثناء الحذف' };
    }
}
