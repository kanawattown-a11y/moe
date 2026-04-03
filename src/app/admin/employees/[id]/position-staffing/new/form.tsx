'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPositionStaffing } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50"
        >
            {pending ? 'جاري الحفظ...' : 'حفظ قرار الملاك'}
        </button>
    );
}

const initialState = {
    message: '',
    errors: {} as { appointment_type?: string[] }
};

export default function NewPositionStaffingForm({ employeeId }: { employeeId: number }) {
    const [state, dispatch] = useActionState(createPositionStaffing, initialState);

    return (
        <form action={dispatch} className="space-y-6">
            <input type="hidden" name="employee_id" value={employeeId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نمط التعيين *</label>
                    <input
                        name="appointment_type"
                        type="text"
                        placeholder="مثال: أصيل، وكيل، الخ..."
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-0 transition text-gray-800"
                        required
                    />
                    {state?.errors?.appointment_type && <p className="text-red-500 text-sm mt-1">{state.errors.appointment_type}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم القرار</label>
                    <input
                        name="decision_number"
                        type="text"
                        placeholder="أدخل رقم القرار إن وجد"
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

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات</label>
                    <textarea
                        name="notes"
                        rows={3}
                        placeholder="أضف أي تفاصيل أو ملاحظات أخرى هنا..."
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-0 transition text-gray-800"
                    ></textarea>
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
