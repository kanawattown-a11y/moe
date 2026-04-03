import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Database, PlusCircle, Play, Trash2 } from 'lucide-react';
import { createMetaTable, deleteMetaTable, triggerSchemaApply, syncSystemTables } from './actions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function BuilderDashboard() {
    const tables = await prisma.metaTable.findMany({
        include: {
            _count: {
                select: { fields: true, relations: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    async function applySchema() {
        'use server';
        await triggerSchemaApply();
        revalidatePath('/admin/builder');
        revalidatePath('/admin/settings');
    }

    async function handleSyncSystem() {
        'use server';
        await syncSystemTables();
        revalidatePath('/admin/builder');
    }

    async function deleteTable(formData: FormData) {
        'use server';
        await deleteMetaTable(parseInt(formData.get('id') as string));
    }

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Database className="text-primary w-8 h-8" />
                        منشئ النماذج المرن (Low-Code)
                    </h1>
                    <p className="text-gray-500 mt-2">قم بإنشاء جداول قاعدة بيانات جديدة وإضافة حقول مخصصة ديناميكياً.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <form action={handleSyncSystem}>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-md flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            مزامنة جداول النظام الثابتة
                        </button>
                    </form>
                    <form action={applySchema}>
                        <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-md flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            تطبيق التعديلات على قاعدة البيانات
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <form action={async (formData: FormData) => { 'use server'; await createMetaTable(formData); }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                        <h3 className="font-bold text-lg border-b pb-2 mb-2">إنشاء جدول جديد</h3>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">اسم الجدول في الرابط (الاسم البرمجي)</label>
                            <input name="name" type="text" required placeholder="مثال: Dynamic_CarBrands" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-400 font-bold" dir="ltr" />
                            <p className="text-xs text-gray-500 mt-1 font-medium">يجب أن يكون باللغة الإنجليزية وبدون مسافات.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">الاسم المعروض (عربي)</label>
                            <input name="title" type="text" required placeholder="مثال: ماركات السيارات" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-400 font-bold" />
                        </div>

                        <button type="submit" className="mt-2 bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition font-bold flex justify-center items-center gap-2">
                            <PlusCircle className="w-5 h-5" />
                            إضافة الجدول
                        </button>
                    </form>

                    <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100">
                        <strong>ملاحظة هامة:</strong> أي جدول جديد لن يظهر في النظام الفعلي إلا بعد الضغط على الزر الأخضر <strong>"تطبيق التعديلات"</strong> بالأعلى. ستستغرق العملية بضع ثوانٍ لإعادة بناء الخادم.
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                                <tr>
                                    <th className="p-4">الاسم المعروض</th>
                                    <th className="p-4">الاسم البرمجي</th>
                                    <th className="p-4 text-center">عدد الحقول</th>
                                    <th className="p-4">تاريخ الإنشاء</th>
                                    <th className="p-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {tables.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">لا يوجد جداول ديناميكية حتى الآن.</td>
                                    </tr>
                                ) : tables.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                                            <Link href={`/admin/builder/${t.id}`} className="hover:text-primary">{t.title}</Link>
                                            {t.isSystem && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">نظام أساسي</span>}
                                        </td>
                                        <td className="p-4 text-gray-500 font-mono text-sm" dir="ltr">{t.name}</td>
                                        <td className="p-4 text-center text-gray-600">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{t._count.fields} حقل / {t._count.relations} ربط</span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">{t.createdAt.toLocaleDateString('ar-SA')}</td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            <Link href={`/admin/builder/${t.id}`} className="text-primary bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/20 transition">إدارة الحقول</Link>
                                            {!t.isSystem && (
                                                <form action={deleteTable}>
                                                    <input type="hidden" name="id" value={t.id} />
                                                    <button type="submit" className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition" title="حذف">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
