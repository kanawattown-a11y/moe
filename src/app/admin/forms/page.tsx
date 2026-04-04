import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Plus, ExternalLink, PenTool, Trash2 } from 'lucide-react';
import { deleteForm } from './actions';

export default async function CustomFormsPage() {
    const forms = await prisma.customForm.findMany({
        orderBy: {
            created_at: 'desc'
        }
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">بناء النماذج المخصصة</h1>
                    <p className="text-gray-500 mt-2">قم ببناء نماذج إدخال بيانات مخصصة ومشاركتها للعموم</p>
                </div>
                <Link href="/admin/forms/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <Plus size={20} />
                    <span>إنشاء نموذج جديد</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form: any) => (
                    <div key={form.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        {form.title}
                                        {form.isQuiz && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">اختبار تقييمي</span>}
                                    </h3>
                                    <p className="text-xs text-gray-500 flex flex-col gap-1 mt-1">
                                        <span>جدول النظام: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">{form.target_table}</span></span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 flex-grow mb-6 line-clamp-2">
                            {form.description || 'لا يوجد وصف مضاف لهذا النموذج.'}
                        </div>

                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                            <Link
                                href={`/admin/forms/${form.id}`}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                            >
                                <PenTool size={16} />
                                تصميم النموذج
                            </Link>

                            <a
                                href={`/forms/${form.slug}`}
                                target="_blank" rel="noreferrer"
                                className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={16} />
                                فتح للاختبار
                            </a>

                            <form action={async () => { 'use server'; await deleteForm(form.id); }}>
                                <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="حذف النموذج">
                                    <Trash2 size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}

                {forms.length === 0 && (
                    <div className="col-span-full bg-white rounded-2xl p-16 text-center text-gray-500 border border-gray-100 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FileText size={32} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 mb-1">لا توجد نماذج مخصصة</span>
                        <span className="text-sm text-gray-500">انقر على زر "إنشاء نموذج جديد" للبدء ببناء استبيان أو نموذج إدخال بيانات</span>
                    </div>
                )}
            </div>
        </div>
    );
}
