'use client';

import { useActionState } from 'react';
import { createLeaveRequest } from '../actions';
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

export default function VacationForm({ employees }: { employees: Employee[] }) {
    const [state, formAction, isPending] = useActionState(createLeaveRequest, null);

    return (
        <form action={formAction} className="space-y-6">
            {state?.message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                    {state.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع الإجازة <span className="text-red-500">*</span></label>
                    <input type="text" name="type" required className={inputClasses} placeholder="إدارية، صحية، أمومة..." />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم قرار الإجازة</label>
                    <input type="text" name="decision_num" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المدة (أيام)</label>
                    <input type="number" name="duration" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ بداية الإجازة</label>
                    <input type="date" name="start_date" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ نهاية الإجازة</label>
                    <input type="date" name="end_date" className={inputClasses} />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ المباشرة الفعلي</label>
                    <input type="date" name="actual_start_date" className={inputClasses} />
                </div>
            </div>

            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">في حال قطع الإجازة:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">رقم قرار القطع</label>
                        <input type="text" name="interruption_decision_num" className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ قرار القطع</label>
                        <input type="date" name="interruption_date" className={inputClasses} />
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
                    {isPending ? 'جاري الحفظ...' : 'حفظ الإجازة'}
                </button>
                <Link
                    href="/admin/vacations"
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowRight size={20} />
                    إلغاء وعودة
                </Link>
            </div>
        </form>
    );
}
