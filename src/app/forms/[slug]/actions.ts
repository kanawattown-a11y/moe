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

    if (!form || !form.isActive) return { message: 'النموذج غير متاح حالياً.' };

    let dataPayload: any = {};
    let modelName = '';

    // Determine target Prisma model
    if (form.targetTable.startsWith('dyn-')) {
        const slug = form.targetTable.replace('dyn-', '');
        const metaTable = await prisma.metaTable.findUnique({ where: { slug } });
        if (!metaTable) return { message: 'الجدول الوجهة غير موجود' };
        modelName = metaTable.name;
    } else {
        const config = TABLE_CONFIG[form.targetTable];
        if (!config) return { message: 'إعدادات الجدول غير صحيحة' };
        modelName = config.model;
    }

    try {
        const hiddenFieldsRaw = formData.get('__hidden_fields') as string;
        const hiddenFields = hiddenFieldsRaw ? JSON.parse(hiddenFieldsRaw) : [];

        // Build payload
        for (const field of form.fields) {
            if (hiddenFields.includes(field.dbColumnName)) {
                // Ignore completely, field wasn't seen by user
                continue;
            }

            const rawValue = formData.get(field.dbColumnName);

            if (field.isRequired && (!rawValue || (rawValue instanceof File && rawValue.size === 0))) {
                return { message: `الرجاء تعبئة الحقل المطلوب: ${field.label}` };
            }

            if (rawValue === null || rawValue === '') continue;

            if (field.inputType === 'file') {
                if (rawValue instanceof File && rawValue.size > 0) {
                    const bytes = await rawValue.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const fileName = `${Date.now()}-${rawValue.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
                    const uploadDir = join(process.cwd(), 'public', 'uploads');
                    try { await mkdir(uploadDir, { recursive: true }); } catch (e) { }
                    await writeFile(join(uploadDir, fileName), buffer);
                    dataPayload[field.dbColumnName] = `/uploads/${fileName}`;
                } else if (typeof rawValue === 'string' && rawValue.startsWith('http')) {
                    // Already an S3 URL from frontend
                    dataPayload[field.dbColumnName] = rawValue;
                }
            } else if (field.dbColumnType === 'Int') {
                dataPayload[field.dbColumnName] = parseInt(rawValue as string);
            } else if (field.dbColumnType === 'Float') {
                dataPayload[field.dbColumnName] = parseFloat(rawValue as string);
            } else if (field.dbColumnType === 'Boolean' || field.inputType === 'checkbox') {
                dataPayload[field.dbColumnName] = rawValue === 'on';
            } else if (field.dbColumnType === 'DateTime') {
                dataPayload[field.dbColumnName] = new Date(rawValue as string);
            } else {
                dataPayload[field.dbColumnName] = rawValue as string;
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
