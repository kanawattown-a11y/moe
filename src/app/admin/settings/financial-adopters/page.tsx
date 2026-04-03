import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AddItemForm from './form';
import DeleteItemButton from './delete-button';

export const dynamic = 'force-dynamic';

export default async function FinancialAdoptersPage() {
    const items = await prisma.financialAdopter.findMany({
        orderBy: { id: 'desc' },
        take: 100 // Safe limit
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                        <Link href="/admin/settings" className="hover:text-primary transition">الإعدادات</Link>
                        <span>/</span>
                        <span className="text-gray-600">المعتمدین المالیین</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">المعتمدین المالیین</h1>
                </div>
                <Link href="/admin/settings" className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm">
                    عودة للقائمة
                </Link>
            </div>

            <div className="max-w-4xl mx-auto">
                <AddItemForm />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                            <tr>
                                <th className="p-5 w-20">#</th>
                                <th className="p-5">اسم المعتمد</th>
                                <th className="p-5">الرقم الوطني</th>
                                <th className="p-5 w-32">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="p-5 text-gray-400 text-sm font-mono">{item.id}</td>
                                    <td className="p-5 font-bold text-gray-900 group-hover:text-primary transition-colors">{item.name}</td>
                                    <td className="p-5 text-gray-600 font-mono tracking-widest">{item.national_id?.toString() || '---'}</td>
                                    <td className="p-5">
                                        <DeleteItemButton id={item.id} />
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-lg text-gray-900 mb-1">لا توجد بيانات</span>
                                            <span className="text-sm">لم يتم إضافة أي معتمد مالي بعد.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
