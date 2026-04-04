import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteSchoolButton from './delete-button';
import { School, Search, Plus } from 'lucide-react';

import SearchBar from '../employees/SearchBar';
import { checkAuth, hasPermission, isManager } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

async function getSchools(query: string) {
    const where: any = {};
    if (query) {
        where.name = { 
            contains: query,
            mode: 'insensitive'
        };
    }

    return await prisma.school.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
            city: true,
            village: true,
            _count: {
                select: { employees: true }
            }
        },
        take: 50
    });
}

export default async function AdminSchoolsPage(props: { searchParams: Promise<{ q?: string }> }) {
    const session = await checkAuth();
    if (!hasPermission(session, '/admin/schools')) {
        redirect('/admin?error=Unauthorized');
    }
    const isUserAManager = isManager(session);

    const searchParams = await props.searchParams;
    const query = searchParams.q || '';
    const schools = await getSchools(query);

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة المدارس والمجمعات</h1>
                    <p className="text-gray-500 mt-2">إدارة المؤسسات التعليمية والملاكات المرتبطة بها</p>
                </div>
                {isUserAManager && (
                    <Link href="/admin/schools/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                        <Plus size={20} />
                        <span>إضافة مدرسة جديدة</span>
                    </Link>
                )}
            </div>

            {/* Fast Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <SearchBar placeholder="ابحث عن مدرسة بالاسم..." />
                <div className="text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 whitespace-nowrap">
                    {query ? `نتائج البحث: ${schools.length}` : 'إجمالي المعروض: 50 سجل'}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                            <tr>
                                <th className="p-5">اسم المدرسة</th>
                                <th className="p-5">الموقع الجغرافي</th>
                                <th className="p-5">المرحلة الدراسية</th>
                                <th className="p-5 text-center">الملاك (موظفين)</th>
                                <th className="p-5">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {schools.map(school => (
                                <tr key={String(school.id)} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                                <School size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 leading-tight block group-hover:text-primary transition-colors">{school.name}</div>
                                                {school.stat_number && <div className="text-xs text-gray-400 mt-1 font-mono">الرقم الإحصائي: {school.stat_number}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-gray-600 font-medium">
                                        {school.city?.name} {school.village?.name ? <span className="text-gray-400 mx-1">/</span> : ''} {school.village?.name}
                                    </td>
                                    <td className="p-5">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                                            {school.phase || 'غير محدد'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center font-bold text-primary">
                                        {school._count.employees}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex gap-2">
                                            <Link href={`/admin/schools/${school.id}/edit`} className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                                تعديل
                                            </Link>
                                            <DeleteSchoolButton schoolId={String(school.id) as any} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {schools.length === 0 && (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <School size={32} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 mb-1">لا توجد نتائج مطابقة</span>
                        <span className="text-sm">لم نتمكن من العثور على أية مدارس تطابق معايير البحث</span>
                    </div>
                )}
            </div>
        </div>
    );
}
