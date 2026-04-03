import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // 1. Fetch Key Metrics
    const employeeCount = await prisma.employee.count();
    const schoolCount = await prisma.school.count();
    const newsCount = await prisma.article.count();
    const bookCount = await prisma.book.count();

    // 2. Fetch Demographic Data for Charts
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

    // 3. Fetch recent activities
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

    // 4. Retirement Prediction
    const sixtyYearsAgo = new Date();
    sixtyYearsAgo.setFullYear(sixtyYearsAgo.getFullYear() - 60);
    
    const upcomingRetirements = await prisma.employee.count({
        where: {
            birth_date: { lte: sixtyYearsAgo },
            status_id: 1 // Active
        }
    });

    // 5. Job Categories Distribution
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
                <div className="hidden md:flex gap-2">
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        النظام مستقر
                    </span>
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
