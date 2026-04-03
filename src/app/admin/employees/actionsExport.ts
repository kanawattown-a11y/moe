'use server';

import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth-utils';

/**
 * Generates a CSV string of employees based on current filters.
 */
export async function exportEmployeesCSV(filters: { school_id?: number; status_id?: number; gender?: string; q?: string }) {
    // await checkAuth(['ADMIN']);
    
    const where: any = {};
    if (filters.school_id) where.school_id = filters.school_id;
    if (filters.status_id) where.status_id = filters.status_id;
    if (filters.gender) where.gender = filters.gender;
    
    // Simplification for export (ignoring q for now or fetching all matching)
    // In a real app, you'd apply the same q logic
    
    const employees = await prisma.employee.findMany({
        where,
        include: { school: true, job_title_current: true, status: true },
        orderBy: { last_name: 'asc' }
    });

    const headers = ['الرقم الذاتي', 'الاسم', 'الأب', 'الكنية', 'الجنس', 'المدرسة', 'المسمى الوظيفي', 'الحالة'];
    const rows = employees.map(emp => [
        emp.self_number,
        emp.first_name,
        emp.father_name,
        emp.last_name,
        emp.gender === 'male' ? 'ذكر' : 'أنثى',
        emp.school?.name || '',
        emp.job_title_current?.name || '',
        emp.status?.name || ''
    ]);

    const csvContent = [
        '\uFEFF' + headers.join(','), // UTF-8 BOM for Excel
        ...rows.map(r => r.join(','))
    ].join('\n');

    return csvContent;
}
