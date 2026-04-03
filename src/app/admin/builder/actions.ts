'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { updateDynamicSchema } from './schemaService';
import { TABLE_CONFIG } from '@/app/admin/settings/constants';

// --- TABLE ACTIONS ---

export async function syncSystemTables() {
    try {
        const existingSystem = await prisma.metaTable.findMany({ where: { isSystem: true } });
        const existingSlugs = new Set(existingSystem.map((t: any) => t.slug));

        for (const [slug, config] of Object.entries(TABLE_CONFIG)) {
            if (!existingSlugs.has(slug)) {
                // @ts-ignore
                await prisma.metaTable.create({
                    data: {
                        name: config.model,
                        slug: slug,
                        title: config.title,
                        isSystem: true
                    }
                });
            }
        }
        revalidatePath('/admin/builder');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'فشل المزامنة.' };
    }
}

export async function createMetaTable(formData: FormData) {
    const title = formData.get('title') as string;
    const nameStr = formData.get('name') as string;

    if (!title || !nameStr) {
        return { error: 'يرجى إدخال اسم الجدول.' };
    }

    // Ensure model name is alphanumeric and PascalCase
    const name = nameStr.replace(/[^a-zA-Z0-9_]/g, '');
    const slug = nameStr.toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
        await prisma.metaTable.create({
            data: { title, name, slug },
        });
        revalidatePath('/admin/builder');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'فشل إضافة الجدول.' };
    }
}

export async function deleteMetaTable(id: number) {
    try {
        await prisma.metaTable.delete({ where: { id } });
        revalidatePath('/admin/builder');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

// --- FIELD ACTIONS ---

export async function createMetaField(formData: FormData) {
    const tableId = parseInt(formData.get('tableId') as string);
    const nameStr = formData.get('name') as string;
    const label = formData.get('label') as string;
    const type = formData.get('type') as string;
    const isRequired = formData.get('isRequired') === 'on';
    const inputType = (formData.get('inputType') as string) || 'text';
    const options = (formData.get('options') as string) || null;

    if (!tableId || !nameStr || !label || !type) {
        return { error: 'يرجى ملء جميع الحقول الإلزامية.' };
    }

    const name = nameStr.toLowerCase().replace(/[^a-z0-9_]/g, '');

    try {
        await prisma.metaField.create({
            data: { tableId, name, label, type, isRequired, inputType, options },
        });
        revalidatePath(`/admin/builder/${tableId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'فشل إضافة الحقل.' };
    }
}

export async function deleteMetaField(id: number, tableId: number) {
    try {
        await prisma.metaField.delete({ where: { id } });
        revalidatePath(`/admin/builder/${tableId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

// --- RELATION ACTIONS ---

export async function createMetaRelation(formData: FormData) {
    const tableId = parseInt(formData.get('tableId') as string);
    const targetModel = formData.get('targetModel') as string;
    const targetLabel = formData.get('targetLabel') as string;

    if (!tableId || !targetModel || !targetLabel) {
        return { error: 'يرجى ملء جميع الحقول الإلزامية.' };
    }

    const foreignKey = `${targetModel.toLowerCase()}_id`;

    try {
        await prisma.metaRelation.create({
            data: { tableId, targetModel, targetLabel, foreignKey },
        });
        revalidatePath(`/admin/builder/${tableId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'فشل ربط الجدول.' };
    }
}

export async function deleteMetaRelation(id: number, tableId: number) {
    try {
        await prisma.metaRelation.delete({ where: { id } });
        revalidatePath(`/admin/builder/${tableId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

// --- APPLY ARCHITECTURE ---

export async function triggerSchemaApply() {
    try {
        const result = await updateDynamicSchema();
        if (!result.success) throw new Error(result.error);
        revalidatePath('/admin/builder');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'فشل في تطبيق التعديلات على قاعدة البيانات.' };
    }
}
