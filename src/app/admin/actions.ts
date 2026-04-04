'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { createAuditLog } from '@/services/audit-service'

const CreateUserSchema = z.object({
    username: z.string().min(3, { message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' }),
    password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
    confirmPassword: z.string().min(1, { message: 'يرجى تأكيد كلمة المرور' }),
    role: z.string().min(1, { message: 'يرجى اختيار الدور' }),
    employeeId: z.coerce.number().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
})

export async function createUser(prevState: any, formData: FormData) {
    const validatedFields = CreateUserSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        role: formData.get('role'),
        employeeId: formData.get('employeeId') ? Number(formData.get('employeeId')) : null,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'البيانات غير مكتملة.',
        }
    }

    const { username, password, role, employeeId } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)
    const isActive = formData.get('is_active') === 'on';
    const permissions = formData.getAll('permissions');

    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                is_active: isActive,
                linked_employee_id: employeeId || null,
                // @ts-ignore
                permissions: permissions.length > 0 ? permissions : null,
            },
        })

        await createAuditLog({
            action: 'CREATE',
            resource: 'User',
            resourceId: user.id.toString(),
            details: `Created user account: ${username} with role ${role}`,
        });
    } catch (error) {
        console.error(error);
        return {
            message: 'حدث خطأ أثناء إنشاء المستخدم. قد يكون اسم المستخدم موجوداً مسبقاً.',
        }
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}

const UpdateUserSchema = z.object({
    role: z.string().min(1, { message: 'يرجى اختيار الدور' }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    employeeId: z.coerce.number().optional().nullable(),
}).refine((data) => {
    if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
}).refine((data) => {
    if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
    }
    return true;
}, {
    message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    path: ['password'],
})

export async function updateUser(userId: number, prevState: any, formData: FormData) {
    const validatedFields = UpdateUserSchema.safeParse({
        role: formData.get('role'),
        password: formData.get('password') || undefined,
        confirmPassword: formData.get('confirmPassword') || undefined,
        employeeId: formData.get('employeeId') ? Number(formData.get('employeeId')) : null,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'البيانات غير مكتملة.',
        }
    }

    const { role, password, employeeId } = validatedFields.data
    const isActive = formData.get('is_active') === 'on';
    const permissions = formData.getAll('permissions');

    const data: any = {
        role,
        is_active: isActive,
        linked_employee_id: employeeId || null,
        // @ts-ignore
        permissions: permissions.length > 0 ? permissions : null,
    }

    if (password && password.length >= 6) {
        data.password = await bcrypt.hash(password, 10)
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data,
        })

        await createAuditLog({
            action: 'UPDATE',
            resource: 'User',
            resourceId: userId.toString(),
            details: `Updated user account: role=${role}, active=${isActive}`,
        });
    } catch (error) {
        console.error(error);
        return {
            message: 'حدث خطأ أثناء تحديث المستخدم.',
        }
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}

export async function deleteUser(userId: number) {
    try {
        await prisma.user.delete({
            where: { id: userId },
        })

        await createAuditLog({
            action: 'DELETE',
            resource: 'User',
            resourceId: userId.toString(),
            details: `Deleted user account ID: ${userId}`,
        });
        revalidatePath('/admin/users')
    } catch (error) {
        console.error("Failed to delete user:", error);
        throw new Error('Failed to delete user');
    }
}
