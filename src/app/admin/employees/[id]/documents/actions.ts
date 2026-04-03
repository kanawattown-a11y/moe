'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAuditLog } from '@/services/audit-service';

export async function addDocument(employeeId: number, formData: FormData) {
    const title = formData.get('title') as string;
    const category = formData.get('file_type') as string; // in schema it's 'type'
    const file_url = formData.get('file_url') as string;

    if (!title || !category || !file_url) {
        throw new Error('جميع الحقول مطلوبة');
    }

    const doc = await prisma.employeeDocument.create({
        data: {
            employee_id: employeeId,
            title,
            type: category,
            file_url,
        }
    });

    // Log the action
    await createAuditLog({
        action: 'CREATE',
        resource: 'EmployeeDocument',
        resourceId: doc.id.toString(),
        details: `Added document: ${title} for employee ${employeeId}`,
    });

    revalidatePath(`/admin/employees/${employeeId}`);
    redirect(`/admin/employees/${employeeId}`);
}
