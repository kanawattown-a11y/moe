'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createAuditLog } from '@/services/audit-service';

/**
 * Generates salary records for all active employees for a given month/year.
 */
export async function generateSalaries(month: number, year: number) {
    const employees = await prisma.employee.findMany({
        where: { status_id: 1 }, // Active
        select: { 
            id: true, 
            base_salary: true,
            family_allowance: true,
            nature_of_work_allowance: true,
            other_deductions: true,
            job_category: { select: { name: true } } 
        }
    });

    let count = 0;
    for (const emp of employees) {
        const baseSalary = Number(emp.base_salary) || 0;
        const allowances = (Number(emp.family_allowance) || 0) + (Number(emp.nature_of_work_allowance) || 0);
        const deductions = Number(emp.other_deductions) || 0;
        const total = baseSalary + allowances - deductions;
        
        // Check if record already exists
        const existing = await prisma.salaryRecord.findFirst({
            where: { employee_id: emp.id, month, year }
        });

        if (!existing) {
            const record = await prisma.salaryRecord.create({
                data: {
                    employee_id: emp.id,
                    month,
                    year,
                    base_salary: baseSalary,
                    allowances: allowances,
                    deductions: deductions,
                    total: total,
                    is_paid: false
                }
            });

            // Notify the user if they have a linked account
            const linkedUser = await prisma.user.findFirst({ 
                where: { employee_id: emp.id } 
            });
            
            if (linkedUser) {
                await prisma.notification.create({
                    data: {
                        user_id: linkedUser.id,
                        title: 'تم إصدار كشف الراتب',
                        message: `تم توليد كشف الراتب لشهر ${month}/${year}. المبلغ الصافي: ${record.total.toLocaleString()} ل.س`,
                        type: 'info'
                    }
                });
            }
            count++;
        }
    }

    await createAuditLog({
        action: 'CREATE',
        resource: 'SalaryRecords',
        resourceId: `${month}/${year}`,
        details: { count }
    });
    
    revalidatePath('/admin/payroll');
    return { success: true, count };
}

/**
 * Marks a salary record as paid.
 */
export async function markAsPaid(recordId: number) {
    const record = await prisma.salaryRecord.update({
        where: { id: recordId },
        data: { is_paid: true },
        include: { employee: true }
    });

    // Notify the user
    const linkedUser = await prisma.user.findFirst({ 
        where: { employee_id: record.employee_id } 
    });

    if (linkedUser) {
        await prisma.notification.create({
            data: {
                user_id: linkedUser.id,
                title: 'تم صرف الراتب',
                message: `تم تأكيد صرف مرتبك لشهر ${record.month}/${record.year}. يرجى مراجعة الصراف أو محاسب المجمع.`,
                type: 'success'
            }
        });
    }

    await createAuditLog({
        action: 'UPDATE',
        resource: 'SalaryRecord',
        resourceId: recordId.toString(),
        details: { is_paid: true }
    });
    
    revalidatePath('/admin/payroll');
}
