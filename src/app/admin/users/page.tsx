import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteUserButton from './delete-button';
import { Users, Plus, ShieldCheck } from 'lucide-react';

import SearchBar from '../employees/SearchBar';

async function getUsers(query: string) {
    const where: any = {};
    if (query) {
        where.username = { 
            contains: query,
            mode: 'insensitive'
        };
    }
    return await prisma.user.findMany({
        where,
        include: {
            employee: {
                select: { full_name_triplet: true, self_number: true }
            }
        },
        orderBy: { username: 'asc' }
    });
}

export default async function UsersPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || '';
    const users = await getUsers(query);

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة المستخدمين</h1>
                    <p className="text-gray-500 mt-2">إدارة حسابات النظام والصلاحيات الممنوحة</p>
                </div>
                <Link href="/admin/users/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <Plus size={20} />
                    <span>إضافة مستخدم جديد</span>
                </Link>
            </div>

            {/* Fast Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <SearchBar placeholder="ابحث عن مستخدم بالاسم..." />
                <div className="text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 whitespace-nowrap">
                    {query ? `نتائج البحث: ${users.length}` : `إجمالي المستخدمين: ${users.length}`}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                        <tr>
                            <th className="p-4">اسم المستخدم</th>
                            <th className="p-4">الدور (Role)</th>
                            <th className="p-4">الموظف المرتبط</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">تاريخ الإنشاء</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={String(user.id)} className="hover:bg-blue-50/40 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 leading-tight block group-hover:text-primary transition-colors">{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                                        user.role === 'TEACHER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            user.role === 'EMPLOYEE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}>
                                        {user.role || 'USER'}
                                    </span>
                                </td>
                                <td className="p-5 text-sm text-gray-500 font-medium">
                                    {user.employee ? (
                                        <span className="text-gray-900">
                                            {user.employee.full_name_triplet} <br />
                                            <small className="text-gray-400">({user.employee.self_number})</small>
                                        </span>
                                    ) : (
                                        <span className="text-gray-300 italic text-xs">غير مرتبط</span>
                                    )}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                        {user.is_active ? 'فعال' : 'معطل'}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-500 text-sm font-medium">
                                    -
                                </td>
                                <td className="p-5">
                                    <div className="flex gap-2">
                                        <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                            تعديل
                                        </Link>
                                        <DeleteUserButton userId={String(user.id) as any} disabled={user.role === 'ADMIN' && user.username === 'admin'} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck size={32} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 mb-1">لا يوجد مستخدمون</span>
                        <span className="text-sm">لم يتم إضافة مستخدمين بعد</span>
                    </div>
                )}
            </div>
        </div>
    );
}
