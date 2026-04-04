import { prisma } from '@/lib/prisma';
import PayrollClient from './PayrollClient';
import { checkAuth } from '@/lib/auth-utils';

export default async function PayrollPage(props: { searchParams: Promise<{ month?: string; year?: string }> }) {
    // await checkAuth(['ADMIN', 'FINANCE']);
    const searchParams = await props.searchParams;
    
    const currentMonth = searchParams.month ? Number(searchParams.month) : new Date().getMonth() + 1;
    const currentYear = searchParams.year ? Number(searchParams.year) : new Date().getFullYear();

    const records = await (prisma as any).salaryRecord.findMany({
        where: {
            month: currentMonth,
            year: currentYear
        },
        include: {
            employee: {
                select: {
                    full_name_triplet: true,
                    job_title_current: { select: { name: true } }
                }
            }
        },
        orderBy: { id: 'desc' },
        take: 100
    });

    // Ensure all data is serializable for Client Components
    const serializedRecords = records.map((r: any) => ({
        ...r,
        id: String(r.id),
        employee_id: String(r.employee_id),
        base_salary: Number(r.base_salary),
        allowances: Number(r.allowances),
        deductions: Number(r.deductions),
        net_salary: Number(r.net_salary),
        created_at: r.created_at?.toISOString(),
        updated_at: r.updated_at?.toISOString(),
    }));

    const summary = {
        totalExpenses: serializedRecords.reduce((acc: number, r: any) => acc + r.net_salary, 0),
        paidCount: serializedRecords.filter((r: any) => r.is_payout).length,
        pendingCount: serializedRecords.filter((r: any) => !r.is_payout).length,
    };

    return (
        <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen">
            <PayrollClient records={serializedRecords} summary={summary} />
        </div>
    );
}
