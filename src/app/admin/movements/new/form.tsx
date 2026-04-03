'use client';

import { useActionState } from 'react';
import { createMovement } from '../actions';
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

export default function MovementForm({ employees }: { employees: Employee[] }) {
    const [state, formAction, isPending] = useActionState(createMovement, null);

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
                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع التنقل <span className="text-red-500">*</span></label>
                    <SearchableSelect
                        name="type"
                        required
                        options={[
                            { value: 'نقل', label: 'نقل' },
                            { value: 'ندب', label: 'ندب' },
                            { value: 'تكليف', label: 'تكليف' },
                            { value: 'فرز', label: 'فرز' },
                            { value: 'إنهاء ندب', label: 'إنهاء ندب' },
                            { value: 'إنهاء تكليف', label: 'إنهاء تكليف' }
                        ]}
                        placeholder="اختر النوع..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">جهة الانفكاك (المنقول منها)</label>
                    <input type="text" name="origin" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الجهة (المنقول إليها)</label>
                    <input type="text" name="destination" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم القرار</label>
                    <input type="text" name="decision_num" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ القرار</label>
                    <input type="date" name="decision_date" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الانفكاك</label>
                    <input type="date" name="leave_date" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ المباشرة</label>
                    <input type="date" name="resumption_date" className={inputClasses} />
                </div>
            </div>

            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">إنهاء الحركة (العودة):</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم قرار الإنهاء</label>
                        <input type="text" name="end_decision_num" className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ قرار الإنهاء</label>
                        <input type="date" name="end_decision_date" className={inputClasses} />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات</label>
                <textarea name="notes" rows={3} className={inputClasses}></textarea>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                    <Save size={20} />
                    {isPending ? 'جاري الحفظ...' : 'حفظ الحركة'}
                </button>
                <Link
                    href="/admin/movements"
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowRight size={20} />
                    إلغاء وعودة
                </Link>
            </div>
        </form>
    );
}
