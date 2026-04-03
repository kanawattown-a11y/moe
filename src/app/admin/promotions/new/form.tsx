'use client';

import { useActionState } from 'react';
import { createPromotion } from '../actions';
import { Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';

interface Employee {
    id: number;
    first_name: string | null;
    last_name: string | null;
    national_id: string | null;
    job_title_current: { name: string | null } | null;
}

const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-primary font-medium bg-gray-50 focus:bg-white";

export default function PromotionForm({ employees }: { employees: Employee[] }) {
    const [state, formAction, isPending] = useActionState(createPromotion, null);

    return (
        <form action={formAction} className="space-y-6">
            {state?.message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">الموظف <span className="text-red-500">*</span></label>
                    <SearchableSelect
                        name="employee_id"
                        required
                        options={employees.map(emp => ({
                            value: emp.id,
                            label: `${emp.first_name} ${emp.last_name} ${emp.job_title_current?.name ? `(${emp.job_title_current.name})` : ''} - ${emp.national_id || 'بدون رقم'}`
                        }))}
                        placeholder="ابحث عن الموظف (بالاسم أو الرقم الوطني)..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الترفيع</label>
                    <input type="date" name="current_date" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">درجة الكفاءة</label>
                    <input type="number" step="0.01" name="efficiency_grade" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الراتب قبل الترفيع</label>
                    <input type="number" step="0.01" name="salary_before" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الراتب بعد الترفيع</label>
                    <input type="number" step="0.01" name="salary_after" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نسبة العلاوة (%)</label>
                    <input type="number" step="0.01" name="raise_percentage" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">مقدار العلاوة</label>
                    <input type="number" step="0.01" name="raise_amount" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المدة (سنوات)</label>
                    <input type="number" step="0.01" name="duration" className={inputClasses} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات</label>
                    <textarea name="notes" rows={3} className={inputClasses}></textarea>
                </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                    <Save size={20} />
                    {isPending ? 'جاري الحفظ...' : 'حفظ الترفيع'}
                </button>
                <Link
                    href="/admin/promotions"
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowRight size={20} />
                    إلغاء وعودة
                </Link>
            </div>
        </form>
    );
}
