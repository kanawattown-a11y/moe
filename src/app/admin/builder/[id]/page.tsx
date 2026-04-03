import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Trash2, Database, TableProperties } from 'lucide-react';
import { createMetaField, deleteMetaField, createMetaRelation, deleteMetaRelation } from '../actions';

export default async function BuilderTableDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tableId = parseInt(id);
    if (isNaN(tableId)) notFound();

    const metaTable = await prisma.metaTable.findUnique({
        where: { id: tableId },
        include: {
            fields: true,
            relations: true,
        }
    });

    if (!metaTable) notFound();

    async function delField(formData: FormData) {
        'use server';
        await deleteMetaField(parseInt(formData.get('id') as string), tableId);
    }
    async function delRel(formData: FormData) {
        'use server';
        await deleteMetaRelation(parseInt(formData.get('id') as string), tableId);
    }

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/builder" className="text-gray-400 hover:text-primary transition p-2 bg-white rounded-full border border-gray-200">
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            إدارة حقول: {metaTable.title}
                        </h1>
                        <p className="text-gray-500 mt-1 font-mono text-sm" dir="ltr">{metaTable.name}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* FIELDS REGION */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <TableProperties className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-lg">الحقول المخصصة (أعمدة الجدول)</h2>
                        </div>

                        <div className="p-5 border-b border-gray-100">
                            <form action={async (formData: FormData) => { 'use server'; await createMetaField(formData); }} className="flex flex-col gap-4">
                                <input type="hidden" name="tableId" value={tableId} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">الاسم الأجنبي (للبرمجة)</label>
                                        <input name="name" type="text" required placeholder="مثال: brand_name" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400" dir="ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">الاسم المعروض</label>
                                        <input name="label" type="text" required placeholder="مثال: اسم الماركة" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">نوع البيانات (Database Type)</label>
                                        <select name="type" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900">
                                            <option value="String">نص (String)</option>
                                            <option value="Int">رقم صحيح (Int)</option>
                                            <option value="DateTime">تاريخ ووقت (DateTime)</option>
                                            <option value="Boolean">نعم/لا (Boolean)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">شكل الإدخال في الواجهة (Input Type)</label>
                                        <select name="inputType" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900">
                                            <option value="text">حقل نصي عادي (Text)</option>
                                            <option value="textarea">مربع نص كبير (Textarea)</option>
                                            <option value="select">قائمة منسدلة (Dropdown)</option>
                                            <option value="radio">أزرار خيارات (Radio)</option>
                                            <option value="checkbox">مربع تحديد (Checkbox)</option>
                                            <option value="file">رفع ملف / صورة (File)</option>
                                            <option value="time">وقت (Time)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-900 mb-1">خيارات الإدخال (فقط للقوائم وأزرار الخيارات)</label>
                                        <input name="options" type="text" placeholder="مثال: ذكر,أنثى (افصل بينها بفاصلة)" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 col-span-2">
                                        <input type="checkbox" name="isRequired" id="req" className="w-4 h-4 rounded border-gray-400 text-primary focus:ring-primary" />
                                        <label htmlFor="req" className="text-sm font-bold text-gray-800">تركه مطلوباً (إجباري)؟</label>
                                    </div>
                                </div>
                                <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-bold text-sm">إضافة حقل</button>
                            </form>
                        </div>

                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
                                <tr>
                                    <th className="p-3">الاسم المعروض</th>
                                    <th className="p-3">برمجياً</th>
                                    <th className="p-3">نوع البيانات</th>
                                    <th className="p-3">شكل الواجهة</th>
                                    <th className="p-3 text-center">إلزامي؟</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metaTable.fields.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-gray-400">لا يوجد حقول</td></tr>
                                ) : metaTable.fields.map((f: any) => (
                                    <tr key={f.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-bold">{f.label}</td>
                                        <td className="p-3 text-gray-500 font-mono" dir="ltr">{f.name}</td>
                                        <td className="p-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{f.type}</span></td>
                                        <td className="p-3"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{f.inputType}</span></td>
                                        <td className="p-3 text-center">{f.isRequired ? '✅' : '❌'}</td>
                                        <td className="p-3">
                                            <form action={delField}>
                                                <input type="hidden" name="id" value={f.id} />
                                                <button type="submit" className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RELATIONS REGION */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <Database className="w-5 h-5 text-purple-600" />
                            <h2 className="font-bold text-lg">الروابط المرجعية (Foreign Keys)</h2>
                        </div>

                        <div className="p-5 border-b border-gray-100">
                            <form action={async (formData: FormData) => { 'use server'; await createMetaRelation(formData); }} className="flex flex-col gap-4">
                                <input type="hidden" name="tableId" value={tableId} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">الجدول المرتبط (Target Model)</label>
                                        <input name="targetModel" type="text" required placeholder="مثال: JobCategory" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400" dir="ltr" />
                                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">اسم الجدول في Prisma تماماً وبأحرف كبيرة وصغيرة متطابقة.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">الاسم المعروض للقائمة</label>
                                        <input name="targetLabel" type="text" required placeholder="مثال: الفئة الوظيفية" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                                    </div>
                                </div>
                                <button type="submit" className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-bold text-sm">إضافة ربط جديد</button>
                            </form>
                        </div>

                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
                                <tr>
                                    <th className="p-3">الجدول المرتبط</th>
                                    <th className="p-3">الاسم المعروض</th>
                                    <th className="p-3">المفتاح الأجنبي</th>
                                    <th className="p-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metaTable.relations.length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center text-gray-400">لا يوجد روابط</td></tr>
                                ) : metaTable.relations.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-bold text-purple-700" dir="ltr">{r.targetModel}</td>
                                        <td className="p-3">{r.targetLabel}</td>
                                        <td className="p-3 text-gray-500 font-mono" dir="ltr">{r.foreignKey}</td>
                                        <td className="p-3">
                                            <form action={delRel}>
                                                <input type="hidden" name="id" value={r.id} />
                                                <button type="submit" className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                                            </form>
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
