import { prisma } from '@/lib/prisma';
import FormDesigner from './designer';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { TABLE_CONFIG } from '@/app/admin/settings/constants';

export default async function CustomFormDesignerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const form = await prisma.customForm.findUnique({
        where: { id: Number(id) },
        include: {
            fields: {
                orderBy: { orderIndex: 'asc' }
            }
        }
    });

    if (!form) {
        notFound();
    }

    // Workaround for Prisma Client not being updated yet
    const rawForm = await prisma.$queryRaw<any[]>`SELECT "لون_الترويسة" as "headerColor", "لون_الأزرار" as "buttonColor" FROM "نماذج_مخصصة" WHERE id = ${form.id}`;
    if (rawForm && rawForm[0]) {
        (form as any).headerColor = rawForm[0].headerColor;
        (form as any).buttonColor = rawForm[0].buttonColor;
    }

    // Get table configuration (is it a dynamic table or standard?)
    const tableInfo = await prisma.metaTable.findUnique({
        where: { slug: form.targetTable },
        include: { fields: true }
    });

    let modelName = '';
    if (tableInfo) {
        modelName = tableInfo.name;
    } else {
        const config = TABLE_CONFIG[form.targetTable];
        if (config) modelName = config.model;
        else modelName = form.targetTable;
    }

    let availableColumns: { name: string; type: string; label: string; isRequired: boolean }[] = [];

    // Find in DMMF
    const dmmfModel = Prisma.dmmf.datamodel.models.find(m => m.name.toLowerCase() === modelName.toLowerCase());

    if (dmmfModel) {
        availableColumns = dmmfModel.fields
            .filter(f => f.kind === 'scalar' && !['id', 'createdAt', 'updatedAt'].includes(f.name))
            .map(f => {
                const meta = tableInfo?.fields.find(mf => mf.name === f.name);
                return {
                    name: f.name,
                    type: f.type,
                    label: meta ? meta.label : f.name,
                    isRequired: f.isRequired
                };
            });
    }

    return (
        <div className="p-6 md:p-10 font-cairo min-h-screen bg-gray-50/50" dir="rtl">
            <FormDesigner
                form={form}
                tableName={tableInfo?.title || form.targetTable}
                availableColumns={availableColumns}
            />
        </div>
    );
}
