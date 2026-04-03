'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createFinancialAdopter(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const national_id_str = formData.get('national_id') as string;

    if (!name || name.trim() === '') {
        return { message: 'الرجاء إدخال اسم المعتمد.', errors: { name: ['يرجى إدخال هذا الحقل'] } };
    }

    try {
        let national_id_val = null;
        if (national_id_str && national_id_str.trim().length > 0) {
            national_id_val = BigInt(national_id_str.trim());
        }

        await prisma.financialAdopter.create({
            data: {
                name: name.trim(),
                national_id: national_id_val
            },
        });

        revalidatePath('/admin/settings/financial-adopters');
        return { message: 'success', errors: {} as any };
    } catch (error) {
        console.error("Failed to create financial adopter:", error);
        return { message: 'حدث خطأ أثناء الإضافة. قد يكون الرقم الوطني غير صالح.', errors: {} as any };
    }
}

export async function deleteFinancialAdopter(id: number) {
    try {
        await prisma.financialAdopter.delete({
            where: { id },
        });
        revalidatePath('/admin/settings/financial-adopters');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete financial adopter:", error);
        return { success: false, message: 'لا يمكن حذف المعتمد المالي، قد يكون مرتبطاً ببيانات أخرى.' };
    }
}
