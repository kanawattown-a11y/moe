'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createForm(prevState: any, formData: FormData) {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const targetTable = formData.get('targetTable') as string;
    const description = formData.get('description') as string;
    const allowedRoles = formData.get('allowedRoles') as string;

    if (!title || !slug || !targetTable) {
        return { message: 'يجب تعبئة الحقول الإجبارية: العنوان، الرابط الدائم، والجدول المستهدف.' };
    }

    let newForm;
    try {
                newForm = await prisma.customForm.create({
                    data: {
                        title,
                        slug,
                        targetTable,
                        description,
                        allowedRoles: allowedRoles || null,
                        isQuiz: formData.get('isQuiz') === 'true',
                        headerColor: formData.get('headerColor') as string || "#9333ea",
                        buttonColor: formData.get('buttonColor') as string || "#9333ea",
                        isActive: true
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
    try {
        await prisma.customForm.delete({ where: { id } });
        revalidatePath('/admin/forms');
    } catch (error) {
        console.error("Error deleting form:", error);
    }
}
