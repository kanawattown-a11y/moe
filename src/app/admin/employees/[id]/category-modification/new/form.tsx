'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCategoryModification } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50"
        >
            {pending ? 'جاري الحفظ...' : 'حفظ قرار تعديل الفئة'}
        </button>
    );
}

const initialState = {
    message: '',
    errors: {} as { new_job_category_id?: string[] }
};

export default function NewCategoryModificationForm({
    employeeId,
    currentCategoryName,
    jobCategories,
    jobTitles
}: {
    employeeId: number,
    currentCategoryName: string,
    jobCategories: any[],
    jobTitles: any[]
}) {
    const [state, dispatch] = useActionState(createCategoryModification, initialState);

    return (
        <form action={dispatch} className="space-y-6">
            <input type="hidden" name="employee_id" value={employeeId} />
            <input type="hidden" name="current_job_category" value={currentCategoryName} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الفئة الوظيفية الجديدة *</label>
                    <select
                        name="new_job_category_id"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:border-primary focus:ring-0 transition text-gray-800"
                        required
                        defaultValue=""
                    >
                        <option value="" disabled>اختر الفئة الجديدة...</option>
                        {jobCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {state?.errors?.new_job_category_id && <p className="text-red-500 text-sm mt-1">{state.errors.new_job_category_id}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المسمى الوظيفي الجديد (اختياري)</label>
                    <select
                        name="new_job_title_id"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:border-primary focus:ring-0 transition text-gray-800"
                        defaultValue=""
                    >
                        <option value="">-- احتفاظ بالمسمى الحالي --</option>
                        {jobTitles.map((title) => (
                            <option key={title.id} value={title.id}>{title.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم القرار</label>
                    <input
                        name="decision_number"
                        type="text"
                        placeholder="أدخل رقم القرار"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-0 transition text-gray-800 font-mono text-left"
                        dir="ltr"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ القرار</label>
                    <input
                        name="decision_date"
                        type="date"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-0 transition text-gray-800"
                    />
                </div>
            </div>

            {state?.message && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                    {state.message}
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <div className="w-full md:w-1/3">
                    <SubmitButton />
                </div>
            </div>
        </form>
    );
}
