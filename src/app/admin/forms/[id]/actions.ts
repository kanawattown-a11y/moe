'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addFieldToForm(prevState: any, formData: FormData) {
    const formId = Number(formData.get('formId'));
    const column_name = formData.get('dbColumnName') as string;
    const data_type = formData.get('dbColumnType') as string;
    const display_name = formData.get('label') as string;

    if (!formId || !column_name || !data_type || !display_name) {
        return { message: 'يجب تعبئة اسم العمود، نوع البيانات، والاسم المعروض.' };
    }

    try {
        // Get current max order
        const maxOrder = await prisma.customFormField.aggregate({
            where: { form_id: formId },
            _max: { order: true }
        });
        const nextOrder = (maxOrder._max.order || 0) + 1;

        await prisma.customFormField.create({
            data: {
                form_id: formId,
                column_name,
                data_type,
                display_name,
                ui_field_type: formData.get('inputType') as string || 'text',
                options: formData.get('options') as string,
                helper_text: formData.get('helperText') as string,
                is_required: formData.get('isRequired') === 'true',
                depends_on_field: formData.get('dependsOnColumn') as string || null,
                dependency_operator: formData.get('dependsOnOperator') as string || 'equals',
                dependency_value: formData.get('dependsOnValue') as string || null,
                correct_answer: formData.get('correctAnswer') as string || null,
                points: Number(formData.get('points')) || 0,
                order: nextOrder
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
        await prisma.customForm.update({
            where: { id: formId },
            data: {
                title: data.title,
                description: data.description,
                header_color: data.headerColor,
                button_color: data.buttonColor
            }
        });

        revalidatePath(`/admin/forms/${formId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating form settings:", error);
        return { error: 'فشل في حفظ الإعدادات.' };
    }
}
