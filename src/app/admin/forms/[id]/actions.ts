'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addFieldToForm(prevState: any, formData: FormData) {
    const formId = Number(formData.get('formId'));
    const dbColumnName = formData.get('dbColumnName') as string;
    const dbColumnType = formData.get('dbColumnType') as string;
    const label = formData.get('label') as string;

    if (!formId || !dbColumnName || !dbColumnType || !label) {
        return { message: 'يجب تعبئة اسم العمود، نوع البيانات، والاسم المعروض.' };
    }

    try {
        // Get current max orderIndex
        const maxOrder = await prisma.customFormField.aggregate({
            where: { formId },
            _max: { orderIndex: true }
        });
        const nextOrder = (maxOrder._max.orderIndex || 0) + 1;

        await prisma.customFormField.create({
            data: {
                formId,
                dbColumnName,
                dbColumnType,
                label,
                inputType: formData.get('inputType') as string || 'text',
                options: formData.get('options') as string,
                helperText: formData.get('helperText') as string,
                isRequired: formData.get('isRequired') === 'true',
                dependsOnColumn: formData.get('dependsOnColumn') as string || null,
                dependsOnOperator: formData.get('dependsOnOperator') as string || 'equals',
                dependsOnValue: formData.get('dependsOnValue') as string || null,
                correctAnswer: formData.get('correctAnswer') as string || null,
                points: Number(formData.get('points')) || 0,
                orderIndex: nextOrder
            }
        });

        revalidatePath(`/admin/forms/${formId}`);
        return { message: '', success: true };
    } catch (error) {
        console.error("Error adding field to form:", error);
        return { message: 'حدث خطأ أثناء إضافة الحقل للنموذج.' };
    }
}

export async function removeFieldFromForm(fieldId: number, formId: number) {
    try {
        await prisma.customFormField.delete({ where: { id: fieldId } });
        revalidatePath(`/admin/forms/${formId}`);
    } catch (error) {
        console.error("Error removing field:", error);
    }
}

export async function updateFormSettings(formId: number, data: { title: string, description?: string, headerColor: string, buttonColor: string }) {
    try {
        // Standard update for title/description
        await prisma.customForm.update({
            where: { id: formId },
            data: {
                title: data.title,
                description: data.description
            }
        });

        // Raw SQL for headerColor/buttonColor to bypass Prisma Client generation issues
        await prisma.$executeRaw`
            UPDATE "نماذج_مخصصة" 
            SET "لون_الترويسة" = ${data.headerColor}, 
                "لون_الأزرار" = ${data.buttonColor} 
            WHERE id = ${formId}
        `;

        revalidatePath(`/admin/forms/${formId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating form settings:", error);
        return { error: 'فشل في حفظ الإعدادات.' };
    }
}
