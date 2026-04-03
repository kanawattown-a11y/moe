import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import { buildEmployeeSearchQuery } from '@/lib/arabicSearch';

export default async function EmployeesPage(props: { searchParams?: Promise<{ q?: string; school_id?: string; status_id?: string; gender?: string }> }) {
    const searchParams = await props.searchParams;
    const q = searchParams?.q || '';
    const schoolId = searchParams?.school_id ? Number(searchParams.school_id) : undefined;
    const statusId = searchParams?.status_id ? Number(searchParams.status_id) : undefined;
    const gender = searchParams?.gender || undefined;

    type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
        include: { school: true, job_title_current: true }
    }>;

    let employees: EmployeeWithRelations[] = [];
    
    // Fetch filter options
    const rawSchools = await prisma.school.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const rawStatuses = await prisma.workStatus.findMany({ select: { id: true, name: true } });

    // Ensure IDs are serializable for Client Components (FilterBar)
    const schools = rawSchools.map(s => ({ ...s, id: String(s.id) }));
    const statuses = rawStatuses.map(s => ({ ...s, id: String(s.id) }));

    const where: any = {};
    if (schoolId) where.school_id = schoolId;
    if (statusId) where.status_id = statusId;
    if (gender) where.gender = gender;

    if (q) {
        const sqlCondition = buildEmployeeSearchQuery(q);
        if (sqlCondition !== Prisma.empty) {
            const matchingIds: any[] = await prisma.$queryRaw`
                SELECT "معرف_الموظف" as id FROM "جدول_الذاتيات"
                WHERE ${sqlCondition}
                LIMIT 100
            `;
            const ids = matchingIds.map((r) => r.id);
            if (ids.length > 0) {
                where.id = { in: ids };
                employees = await prisma.employee.findMany({
                    where,
                    include: { school: true, job_title_current: true },
                });
            }
        }
    } else {
        employees = await prisma.employee.findMany({
            where,
            include: { school: true, job_title_current: true },
            take: 50,
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            {/* Hero Header */}
            <div className="bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/logo.jpg" alt="bg" fill className="object-cover" />
                </div>
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">بوابة العاملين</h1>
                        <p className="text-blue-100 text-lg">نظام إدارة الموارد البشرية والبيانات الذاتية</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                            <span>الرئيسية</span>
                            <span>&larr;</span>
                        </Link>
                        <Link
                            href="/admin/employees/new"
                            className="bg-accent text-primary font-bold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition shadow-lg flex items-center gap-2 transform hover:scale-105"
                        >
                            <span>+ إضافة موظف</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <SearchBar placeholder="ابحث بالاسم، الكنية، أو الرقم الذاتي..." />
                </div>

                <FilterBar schools={schools} statuses={statuses} />

                <div className="bg-white shadow-xl rounded-[2rem] overflow-hidden border border-gray-100 overflow-x-auto">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                            <span className="text-primary text-2xl">👤</span>
                            قائمة سجلات الكادر
                        </h2>
                        <div className="text-xs font-black text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                            {employees.length} سجل متاح حالياً
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                                <tr>
                                    <th className="p-5">الاسم الثلاثي</th>
                                    <th className="p-5">الرقم الذاتي</th>
                                    <th className="p-5">المدرسة</th>
                                    <th className="p-5">المسمى الوظيفي</th>
                                    <th className="p-5">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-4 opacity-30">👥</span>
                                                <p>لا يوجد بيانات موظفين حالياً.</p>
                                                <p className="text-sm mt-2">يمكنك البدء بإضافة موظفين جدد أو استيراد البيانات.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr key={String(emp.id)} className="hover:bg-blue-50/40 transition-colors group">
                                            <td className="p-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold ml-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {emp.first_name?.[0]}
                                                    </div>
                                                    <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{emp.first_name} {emp.father_name} {emp.last_name}</div>
                                                </div>
                                            </td>
                                            <td className="p-5 whitespace-nowrap text-sm font-mono text-gray-500">{emp.self_number}</td>
                                            <td className="p-5 whitespace-nowrap text-sm text-gray-700 font-medium">{emp.school?.name || '-'}</td>
                                            <td className="p-5 whitespace-nowrap">
                                                <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                    {emp.job_title_current?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="p-5 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/admin/employees/${emp.id}`} className="text-primary hover:text-accent font-bold transition px-3 py-1.5 rounded-lg hover:bg-blue-50">تفاصيل</Link>
                                                    <Link href={`/admin/employees/${emp.id}/edit`} className="text-blue-600 hover:text-blue-800 font-bold transition px-3 py-1.5 rounded-lg hover:bg-blue-50">تعديل</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
