'use client';

import { useActionState } from 'react';
import { createTermination } from '../actions';
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

export default function TerminationForm({ employees }: { employees: Employee[] }) {
    const [state, formAction, isPending] = useActionState(createTermination, null);

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
                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع الانفكاك <span className="text-red-500">*</span></label>
                    <SearchableSelect
                        name="type"
                        required
                        options={[
                            { value: 'استقالة', label: 'استقالة' },
                            { value: 'إقالة', label: 'إقالة' },
                            { value: 'تقاعد', label: 'تقاعد' },
                            { value: 'وفاة', label: 'وفاة' },
                            { value: 'نقل خارج المحافظة', label: 'نقل خارج المحافظة' }
                        ]}
                        placeholder="اختر النوع..."
                    />
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
                    <input type="date" name="termination_date" className={inputClasses} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">جهة النقل (في حال كان النقل خارجياً)</label>
                    <input type="text" name="transfer_to" className={inputClasses} placeholder="مثال: التربية في دمشق..." />
                </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                >
                    <Save size={20} />
                    {isPending ? 'جاري الحفظ...' : 'تأكيد الإجراء'}
                </button>
                <Link
                    href="/admin/terminations"
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowRight size={20} />
                    إلغاء وعودة
                </Link>
            </div>
        </form>
    );
}
