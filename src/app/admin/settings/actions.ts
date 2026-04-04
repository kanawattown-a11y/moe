'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { TABLE_CONFIG } from './constants';

const GenericSchema = z.object({
    name: z.string().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }),
    extraField: z.string().optional(), // For things like governorate or type if needed later
});

export async function createItem(tableSlug: string, prevState: any, formData: FormData) {
    let modelName = '';
    let dataPayload: any = {};

    // DYNAMIC NO-CODE LOGIC
    if (tableSlug.startsWith('dyn-')) {
        const slug = tableSlug.replace('dyn-', '');
        // @ts-ignore
        const metaTable = await prisma.metaTable.findUnique({ where: { slug }, include: { fields: true } });
        if (!metaTable) return { message: 'الجدول غير موجود' };

        modelName = metaTable.name;

        // Extract and cast dynamic data
        for (const field of metaTable.fields) {
            const rawValue = formData.get(field.name);
            if (field.inputType === 'file') {
                if (typeof rawValue === 'string' && rawValue.startsWith('http')) {
                    dataPayload[field.name] = rawValue;
                }
            } else if (field.type === 'Int') {
                dataPayload[field.name] = rawValue ? parseInt(rawValue as string) : undefined;
            } else if (field.type === 'Boolean' || field.inputType === 'checkbox') {
                dataPayload[field.name] = formData.get(field.name) === 'on';
            } else if (field.type === 'DateTime') {
                // If it's pure time, handle it safely or let DB handle datetime strings
                dataPayload[field.name] = rawValue ? new Date(rawValue as string) : undefined;
            } else {
                dataPayload[field.name] = rawValue as string;
            }
        }
    }
    // STATIC SYSTEM TABLES LOGIC
    else {
        const config = TABLE_CONFIG[tableSlug];
        if (!config) return { message: 'نوع البيانات غير معرف' };

        const nameFieldKey = config.nameField || 'name';
        const rawName = formData.get(nameFieldKey);
        const validatedFields = GenericSchema.safeParse({ name: rawName });

        if (!validatedFields.success) return { errors: { name: ['البيانات غير مكتملة.'] }, message: 'البيانات غير مكتملة.' };

        modelName = config.model;
        dataPayload[nameFieldKey] = validatedFields.data.name;

        // Mix in any dynamic System Table fields
        // @ts-ignore
        const metaTable = await prisma.metaTable.findUnique({ where: { slug: tableSlug }, include: { fields: true } });
        if (metaTable) {
            for (const field of metaTable.fields) {
                const rawValue = formData.get(field.name);
                if (field.inputType === 'file') {
                    if (typeof rawValue === 'string' && rawValue.startsWith('http')) {
                        dataPayload[field.name] = rawValue;
                    }
                } else if (field.type === 'Int') {
                    dataPayload[field.name] = rawValue ? parseInt(rawValue as string) : undefined;
                } else if (field.type === 'Boolean' || field.inputType === 'checkbox') {
                    dataPayload[field.name] = formData.get(field.name) === 'on';
                } else if (field.type === 'DateTime') {
                    dataPayload[field.name] = rawValue ? new Date(rawValue as string) : undefined;
                } else {
                    dataPayload[field.name] = rawValue as string;
                }
            }
        }
    }

    const modelKey = Object.keys(prisma).find(k => k.toLowerCase() === modelName.toLowerCase());
    if (!modelKey || !(prisma as any)[modelKey]) {
        return { message: 'الجدول غير جاهز. يرجى تفعيل التعديلات من منشئ الجداول.' };
    }

    try {
        // @ts-ignore
        await (prisma as any)[modelKey].create({ data: dataPayload });
    } catch (error) {
        console.error(`Error creating in ${modelName}:`, error);
        return { message: 'حدث خطأ أثناء الحفظ. قد يكون الاسم مكرراً أو البيانات خاطئة.' };
    }

    revalidatePath(`/admin/settings/${tableSlug}`);
    return { message: 'success' };
}

export async function deleteItem(tableSlug: string, id: number) {
    let modelName = '';

    if (tableSlug.startsWith('dyn-')) {
        const slug = tableSlug.replace('dyn-', '');
        // @ts-ignore
        const metaTable = await prisma.metaTable.findUnique({ where: { slug } });
        if (!metaTable) throw new Error('Invalid dynamic table');
        modelName = metaTable.name;
    } else {
        const config = TABLE_CONFIG[tableSlug];
        if (!config) throw new Error('Invalid table');
        modelName = config.model;
    }

    const modelKey = Object.keys(prisma).find(k => k.toLowerCase() === modelName.toLowerCase());
    if (!modelKey || !(prisma as any)[modelKey]) {
        throw new Error('الجدول غير جاهز. يرجى تفعيل التعديلات من منشئ الجداول.');
    }

    try {
        // @ts-ignore
        await (prisma as any)[modelKey].delete({ where: { id } });
        revalidatePath(`/admin/settings/${tableSlug}`);
    } catch (error) {
        console.error(`Error deleting from ${modelName}:`, error);
        throw new Error('لا يمكن حذف هذا العنصر لأنه مرتبط بسجلات أخرى.');
    }
}
