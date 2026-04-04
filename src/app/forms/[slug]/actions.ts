'use server'

import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { TABLE_CONFIG } from '@/app/admin/settings/constants';

export async function submitCustomForm(formId: number, prevState: any, formData: FormData) {
    const form = await prisma.customForm.findUnique({
        where: { id: formId },
        include: { fields: true }
    });

    if (!form || !form.is_active) return { message: 'النموذج غير متاح حالياً.' };

    let dataPayload: any = {};
    let modelName = '';

    // Determine target Prisma model
    if (form.target_table.startsWith('dyn-')) {
        const slug = form.target_table.replace('dyn-', '');
        const metaTable = await prisma.metaTable.findUnique({ where: { slug } });
        if (!metaTable) return { message: 'الجدول الوجهة غير موجود' };
        modelName = metaTable.name;
    } else {
        const config = TABLE_CONFIG[form.target_table];
        if (!config) return { message: 'إعدادات الجدول غير صحيحة' };
        modelName = config.model;
    }

    try {
        const hiddenFieldsRaw = formData.get('__hidden_fields') as string;
        const hiddenFields = hiddenFieldsRaw ? JSON.parse(hiddenFieldsRaw) : [];

        // Build payload
        for (const field of form.fields) {
            if (hiddenFields.includes(field.column_name)) {
                // Ignore completely, field wasn't seen by user
                continue;
            }

            const rawValue = formData.get(field.column_name);

            if (field.is_required && (!rawValue || (rawValue instanceof File && rawValue.size === 0))) {
                return { message: `الرجاء تعبئة الحقل المطلوب: ${field.display_name}` };
            }

            if (rawValue === null || rawValue === '') continue;

            if (field.ui_field_type === 'file') {
                if (rawValue instanceof File && rawValue.size > 0) {
                    const bytes = await rawValue.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${rawValue.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
                    const uploadDir = join(process.cwd(), 'public', 'uploads');
                    try { await mkdir(uploadDir, { recursive: true }); } catch (e) { }
                    await writeFile(join(uploadDir, fileName), buffer);
                    dataPayload[field.column_name] = `/uploads/${fileName}`;
                } else if (typeof rawValue === 'string' && rawValue.startsWith('http')) {
                    // Already an S3 URL from frontend
                    dataPayload[field.column_name] = rawValue;
                }
            } else if (field.data_type === 'Int') {
                dataPayload[field.column_name] = parseInt(rawValue as string);
            } else if (field.data_type === 'Float') {
                dataPayload[field.column_name] = parseFloat(rawValue as string);
            } else if (field.data_type === 'Boolean' || field.ui_field_type === 'checkbox') {
                dataPayload[field.column_name] = rawValue === 'on' || rawValue === 'نعم';
            } else if (field.data_type === 'DateTime') {
                dataPayload[field.column_name] = new Date(rawValue as string);
            } else {
                dataPayload[field.column_name] = rawValue as string;
            }
        }

        // Make the Prisma insert
        // @ts-ignore
        await prisma[modelName].create({ data: dataPayload });

        return { message: '', success: true };
    } catch (error) {
        console.error("Error submitting custom form:", error);
        return { message: 'حدث خطأ في قاعدة البيانات أثناء تسجيل المعلومات. تأكد من صحة المدخلات والتوافقية مع المخطط.' };
    }
}
