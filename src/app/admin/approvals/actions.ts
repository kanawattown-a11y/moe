'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/services/audit-service';

export async function approveTeacher(employeeId: number, username: string) {
    try {
        // 1. Get employee data
        // 1. Get employee data using raw SQL
        const employees: any[] = await prisma.$queryRaw`
            SELECT * FROM "جدول_الذاتيات" WHERE "معرف_الموظف" = ${employeeId}
        `;
        const employee = employees[0];

        if (!employee) throw new Error('الموظف غير موجود');
        
        const defaultPassword = employee.الرقم_الوطني || '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Check if user already exists
        const users: any[] = await prisma.$queryRaw`
            SELECT * FROM "جدول_المستخدمين" WHERE "معرف_الموظف" = ${employeeId}
        `;
        if (users.length > 0) throw new Error('هذا الموظف لديه حساب بالفعل');

        // 2. Create User account
        // Default password could be their national ID if not provided, 
        // but since we asked for it in the form (ideally), we should use it.
        // For now, we'll use a placeholder or their National ID.
        const usernameValue = username || `teacher_${employeeId}`;
        const permissionsJson = JSON.stringify(['/admin/employees', '/admin/news', '/admin/books']);
        
        await prisma.$executeRaw`
            INSERT INTO "جدول_المستخدمين" ("اسم_المستخدم", "كلمة_المرور", "الدور", "نشط", "معرف_الموظف", "الصلاحيات")
            VALUES (${usernameValue}, ${hashedPassword}, 'TEACHER', true, ${employeeId}, ${permissionsJson}::jsonb)
        `;

        // 3. Update employee approval status using raw SQL
        await prisma.$executeRaw`
            UPDATE "جدول_الذاتيات" SET "تم_الموافقة" = true WHERE "معرف_الموظف" = ${employeeId}
        `;

        await createAuditLog({
            action: 'UPDATE',
            resource: 'Employee',
            resourceId: employeeId.toString(),
            details: `Approved teacher registration and created user account: ${username}`,
        });

        revalidatePath('/admin/approvals');
        revalidatePath('/admin/employees');
        return { success: true };
    } catch (error: any) {
        console.error("Error approving teacher:", error);
        return { error: error.message || 'حدث خطأ أثناء الموافقة' };
    }
}

export async function rejectTeacher(employeeId: number) {
    try {
        await prisma.$executeRaw`
            DELETE FROM "جدول_الذاتيات" WHERE "معرف_الموظف" = ${employeeId}
        `;

        await createAuditLog({
            action: 'DELETE',
            resource: 'Employee',
            resourceId: employeeId.toString(),
            details: `Rejected and deleted pending teacher registration ID: ${employeeId}`,
        });

        revalidatePath('/admin/approvals');
        return { success: true };
    } catch (error: any) {
        console.error("Error rejecting teacher:", error);
        return { error: error.message || 'حدث خطأ أثناء الرفض' };
    }
}
