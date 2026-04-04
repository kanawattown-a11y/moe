'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkAuth, hasPermission } from '@/lib/auth-utils';

export async function createForm(prevState: any, formData: FormData) {
    const session = await checkAuth();
    if (!hasPermission(session, '/admin/forms')) {
        return { message: 'ليس لديك صلاحية لإنشاء النماذج.' };
    }
    
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const target_table = formData.get('target_table') as string;
    const description = formData.get('description') as string;
    const allowedRoles = formData.get('allowedRoles') as string;

    if (!title || !slug || !target_table) {
        return { message: 'يجب تعبئة الحقول الإجبارية: العنوان، الرابط الدائم، والجدول المستهدف.' };
    }

    let newForm;
    try {
                newForm = await prisma.customForm.create({
                    data: {
                        title,
                        slug,
                        target_table,
                        description,
                        allowed_roles: allowedRoles || null,
                        is_quiz: formData.get('is_quiz') === 'true',
                        header_color: formData.get('header_color') as string || "#2563eb",
                        button_color: formData.get('button_color') as string || "#2563eb",
                        is_active: true
                    }
                });
    } catch (error: any) {
        console.error("Error creating custom form:", error);
        if (error.code === 'P2002') return { message: 'الرابط الدائم (Slug) مستخدم مسبقاً، يرجى اختيار رابط آخر.' };
        return { message: 'حدث خطأ غير متوقع أثناء حفظ النموذج.' };
    }

    revalidatePath('/admin/forms');
    redirect(`/admin/forms/${newForm.id}`);
}

export async function deleteForm(id: number) {
    const session = await checkAuth();
    if (!hasPermission(session, '/admin/forms')) {
        return { message: 'ليس لديك صلاحية لحذف النماذج.' };
    }

    try {
        await prisma.customForm.delete({ where: { id } });
        revalidatePath('/admin/forms');
    } catch (error) {
        console.error("Error deleting form:", error);
    }
}
