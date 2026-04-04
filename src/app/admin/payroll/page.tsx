import { prisma } from '@/lib/prisma';
import PayrollClient from './PayrollClient';
import PersonalPayrollView from './PersonalPayrollView';
import { checkAuth, getAccessFilter, isManager } from '@/lib/auth-utils';

export default async function PayrollPage(props: { searchParams: Promise<{ month?: string; year?: string }> }) {
    const session = await checkAuth();
    const searchParams = await props.searchParams;
    const isUserAManager = isManager(session);
    
    const currentMonth = searchParams.month ? Number(searchParams.month) : new Date().getMonth() + 1;
    const currentYear = searchParams.year ? Number(searchParams.year) : new Date().getFullYear();

    // Apply security filter
    const accessFilter = getAccessFilter(session);

    // If teacher, we want to see ALL their history, not just current month (or at least more than one)
    // But for the overview, we'll follow the same logic or fetch last 12 months.
    const queryWhere: any = { ...accessFilter };
    if (isUserAManager) {
        queryWhere.month = currentMonth;
        queryWhere.year = currentYear;
    }

    const records = await (prisma as any).salaryRecord.findMany({
        where: queryWhere,
        include: {
            employee: {
                select: {
                    full_name_triplet: true,
                    job_title_current: { select: { name: true } }
                }
            }
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: isUserAManager ? 100 : 12 // Admins see current, Teachers see last 12
    });

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

    if (!isUserAManager) {
        const employeeName = serializedRecords[0]?.employee?.full_name_triplet || session.user.name || 'الموظف';
        return (
            <div className="p-6 md:p-10 bg-gray-50/30 min-h-screen">
                <PersonalPayrollView records={serializedRecords} employeeName={employeeName} />
            </div>
        );
    }

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
