'use client';

import { useActionState } from 'react';
import { createForm } from '../actions';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';

const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white";

interface MetaTable {
    id: number;
    name: string;
    slug: string;
    title: string;
    isSystem: boolean;
}

export default function NewCustomForm({ tables }: { tables: MetaTable[] }) {
    const [state, formAction, isPending] = useActionState(createForm, null);

    return (
        <form action={formAction} className="p-8 space-y-6">
            {state?.message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold mb-6">
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">عنوان النموذج <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="title"
                        required
                        className={inputClasses}
                        placeholder="مثال: استبيان رضا الموظفين"
                    />
                    <p className="text-xs text-gray-500 mt-2">هذا العنوان سيظهر للمستخدمين عند فتح الرابط.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الرابط الدائم (Slug) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input
                            type="text"
                            name="slug"
                            required
                            pattern="[a-z0-9-]+"
                            title="أحرف إنجليزية صغيرة وأرقام وشخطة فقط (-)"
                            className={`${inputClasses} pl-24 text-left`}
                            placeholder="employee-survey"
                            dir="ltr"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm dir-ltr">
                            /forms/
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الجدول المستهدف <span className="text-red-500">*</span></label>
                    <select name="targetTable" required className={inputClasses}>
                        <option value="">-- اختر الجدول الذي سيتم حفظ البيانات فيه --</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.slug}>
                                {table.title} ({table.name}) {table.isSystem ? '[نظام]' : '[ديناميكي]'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">وصف النموذج</label>
                    <textarea
                        name="description"
                        rows={3}
                        className={inputClasses}
                        placeholder="أدخل رسالة ترحيبية أو تعليمات لملء النموذج (خياري)..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">لون الشريط العلوي (Theme)</label>
                    <div className="flex gap-2">
                        <input type="color" name="headerColor" defaultValue="#9333ea" className="w-12 h-12 rounded-xl border border-gray-300 p-1 cursor-pointer bg-gray-50" />
                        <input type="text" placeholder="#9333ea" className={inputClasses} onChange={(e) => {
                             const picker = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                             if (e.target.value.match(/^#[0-9a-f]{6}$/) && picker) picker.value = e.target.value;
                        }} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">لون أزرار التنفيذ (Button)</label>
                    <div className="flex gap-2">
                        <input type="color" name="buttonColor" defaultValue="#9333ea" className="w-12 h-12 rounded-xl border border-gray-300 p-1 cursor-pointer bg-gray-50" />
                        <input type="text" placeholder="#9333ea" className={inputClasses} onChange={(e) => {
                             const picker = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                             if (e.target.value.match(/^#[0-9a-f]{6}$/) && picker) picker.value = e.target.value;
                        }} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">الأدوار المسموحة (Allowed Roles)</label>
                    <input
                        type="text"
                        name="allowedRoles"
                        className={inputClasses}
                        placeholder="اكتب الأدوار مفصولة بفاصلة، مثال: admin, user (اتركه فارغاً ليصبح متاحاً للعموم)"
                    />
                    <p className="text-xs text-gray-500 mt-2">اتركه فارغاً لجعل النموذج "عاماً" ويسجل من قبل أي شخص دون الدخول بحساب.</p>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer bg-blue-50/50 p-4 rounded-xl border border-blue-100 w-full hover:bg-blue-50 transition">
                        <input type="checkbox" name="isQuiz" value="true" className="w-6 h-6 accent-blue-600 rounded" />
                        <div>
                            <span className="font-bold text-blue-900 block">نمط المسابقات والاختبارات (Quiz Mode)</span>
                            <span className="text-xs text-blue-700 mt-1 block">تفعيل هذا الخيار يسمح لك بتحديد أجوبة صحيحة ومنح درجات تلقائية لكل سؤال للتقييم الآلي.</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-gray-100 mt-8">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-purple-600 text-white py-4 px-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:hover:shadow-none"
                >
                    <Save size={20} />
                    {isPending ? 'جاري الإنشاء...' : 'إنشاء والانتقال للمصمم'}
                </button>
                <Link
                    href="/admin/forms"
                    className="px-8 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowRight size={20} />
                    إلغاء
                </Link>
            </div>
        </form>
    );
}
