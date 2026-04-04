import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';
import EmployeeDashboard from './EmployeeDashboard';
import { checkAuth, isManager } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const session = await checkAuth();

    // 1. Manager Dash (Admin / HR)
    if (isManager(session)) {
        const employeeCount = await prisma.employee.count();
        const schoolCount = await prisma.school.count();
        const newsCount = await prisma.news.count();
        const bookCount = await prisma.book.count();

        const statusCountsRaw = await prisma.employee.groupBy({
            by: ['status_id'],
            _count: { id: true },
        });

        const statuses = await prisma.workStatus.findMany();
        const statusCounts = statusCountsRaw.map(sc => {
            const status = statuses.find(s => s.id === sc.status_id);
            return {
                name: status ? status.name : 'غير محدد',
                value: sc._count.id
            };
        }).filter(sc => sc.value > 0);

        const genderCountsRaw = await prisma.employee.groupBy({
            by: ['gender'],
            _count: { id: true },
        });

        const genderCounts = genderCountsRaw.map(g => ({
            name: g.gender || 'غير محدد',
            value: g._count.id
        }));

        const recentEmployees = await prisma.employee.findMany({
            take: 5,
            orderBy: { id: 'desc' },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                job_title_current: { select: { name: true } },
                school: { select: { name: true } }
            }
        });

        const sixtyYearsAgo = new Date();
        sixtyYearsAgo.setFullYear(sixtyYearsAgo.getFullYear() - 60);
        const upcomingRetirements = await prisma.employee.count({
            where: {
                birth_date: { lte: sixtyYearsAgo },
                status_id: 1
            }
        });

        const categoriesRaw = await prisma.employee.groupBy({
            by: ['job_category_id'],
            _count: { id: true }
        });
        const categories = await prisma.jobCategory.findMany();
        const categoryCounts = categoriesRaw.map(cr => {
            const cat = categories.find(c => c.id === cr.job_category_id);
            return {
                name: cat ? cat.name : 'غير محدد',
                value: cr._count.id
            };
        }).filter(c => c.value > 0);

        return (
            <div className="p-6 md:p-10 font-cairo bg-gray-50/50 min-h-screen">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">اللوحة الرئيسية للبيانات</h1>
                        <p className="text-gray-500 mt-2 text-sm">نظرة عامة على إحصائيات النظام والبيانات الحالية</p>
                    </div>
                </div>

                <AdminDashboardClient
                    metrics={{ employeeCount, schoolCount, newsCount, bookCount, upcomingRetirements }}
                    statusCounts={statusCounts}
                    genderCounts={genderCounts}
                    categoryCounts={categoryCounts}
                    recentEmployees={recentEmployees.map(emp => ({ ...emp, id: String(emp.id) }))}
                />
            </div>
        );
    }

    // 2. Employee/Teacher Dashboard (Self-Service)
    const empId = session.user.employee_id;
    if (!empId) {
        return (
            <div className="p-10 text-center font-cairo">
                <h1 className="text-2xl font-bold text-gray-900">مرحباً بك في النظام</h1>
                <p className="text-gray-500 mt-2">حسابك غير مرتبط بملف موظف. يرجى مراجعة الإدارة لربط حسابك.</p>
            </div>
        );
    }

    const employee = await prisma.employee.findUnique({
        where: { id: empId },
        include: {
            school: { select: { name: true } },
            job_title_current: { select: { name: true } },
            work_status: { select: { name: true } }
        }
    });

    const lastSalary = await (prisma as any).salaryRecord.findFirst({
        where: { employee_id: empId },
        orderBy: { year: 'desc', month: 'desc' }
    });

    const activeLeaves = await prisma.leaveRequest.findMany({
        where: { employee_id: empId },
        take: 3,
        orderBy: { start_date: 'desc' }
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/50 min-h-screen">
            <EmployeeDashboard 
                employee={employee} 
                lastSalary={lastSalary} 
                activeLeaves={activeLeaves}
            />
        </div>
    );
}
