import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { UserMinus, Plus, ShieldX } from 'lucide-react';

export default async function TerminationsPage() {
    const terminations = await prisma.termination.findMany({
        include: {
            employee: true,
        },
        orderBy: {
            id: 'desc'
        }
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة ترك العمل والتنقلات الخارجية</h1>
                    <p className="text-gray-500 mt-2">سجل الاستقالات، التقاعد، الوفيات، والنقل خارج المحافظة</p>
                </div>
                <Link href="/admin/terminations/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <Plus size={20} />
                    <span>إضافة انفكاك / نقل جديد</span>
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                        <tr>
                            <th className="p-4">اسم الموظف</th>
                            <th className="p-4">نوع الإجراء</th>
                            <th className="p-4">تاريخ الانفكاك</th>
                            <th className="p-4">رقم القرار</th>
                            <th className="p-4">نقل إلى (إن وجد)</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {terminations.map(t => (
                            <tr key={String(t.id)} className="hover:bg-red-50/40 transition-colors group">
                                <td className="p-5 font-bold text-gray-900 group-hover:text-primary transition-colors">
                                    {t.employee ? `${t.employee.first_name} ${t.employee.last_name}` : 'غير محدد'}
                                </td>
                                <td className="p-5">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-700 border-red-200">
                                        {t.type || '-'}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-600 font-medium">{t.termination_date?.toLocaleDateString('ar-SY') || '-'}</td>
                                <td className="p-5 text-gray-500 text-sm">{t.decision_num || '-'}</td>
                                <td className="p-5 text-gray-700">{t.transfer_to || '-'}</td>
                                <td className="p-5">
                                    <div className="flex gap-2">
                                        <Link href={`/admin/terminations/${t.id}/edit`} className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                            تعديل
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {terminations.length === 0 && (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShieldX size={32} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 mb-1">لا توجد حركات مسجلة</span>
                        <span className="text-sm">لم يتم تسجيل حركات ترك عمل أو نقل خارجي بعد</span>
                    </div>
                )}
            </div>
        </div>
    );
}
