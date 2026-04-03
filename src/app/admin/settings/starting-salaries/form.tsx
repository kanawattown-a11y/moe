'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createStartingSalary } from './actions';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4 md:mt-0 w-full md:w-auto h-11"
        >
            {pending ? 'جاري الحفظ...' : 'إضافة'}
            <span>+</span>
        </button>
    );
}

const initialState = {
    message: '',
    errors: {} as { amount?: string[], job_category_id?: string[], salary_ceiling_id?: string[] }
};

export default function AddItemForm({ jobCategories, salaryCeilings }: { jobCategories: any[], salaryCeilings: any[] }) {
    const [state, dispatch] = useActionState(createStartingSalary, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (state?.message === 'success') {
            formRef.current?.reset();
            router.refresh();
        }
    }, [state, router]);

    return (
        <form ref={formRef} action={dispatch} className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">إضافة أجر بدء تعيين جديد</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">أجر بدء التعيين (ل.س)</label>
                    <input
                        name="amount"
                        type="number"
                        placeholder="مثال: 950000"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-emerald-600 font-bold tracking-widest focus:border-accent focus:ring-0 focus:outline-none transition"
                        required
                        min="1"
                        step="1"
                    />
                    {state?.errors?.amount && <p className="text-red-500 text-sm mt-1">{state.errors.amount}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">صفة التعيين (اختياري)</label>
                    <input
                        name="appointment_capacity"
                        type="text"
                        placeholder="مثال: دكتوراه"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium focus:border-accent focus:ring-0 focus:outline-none transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة الوظيفية</label>
                    <select
                        name="job_category_id"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-700 bg-white focus:border-accent focus:ring-0 focus:outline-none transition cursor-pointer"
                        defaultValue=""
                    >
                        <option value="">-- بدون فئة --</option>
                        {jobCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name || `فئة ${cat.id}`}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">سقف الأجر المقابل</label>
                    <select
                        name="salary_ceiling_id"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-700 bg-white focus:border-accent focus:ring-0 focus:outline-none transition cursor-pointer"
                        defaultValue=""
                    >
                        <option value="">-- بدون سقف --</option>
                        {salaryCeilings.map((c) => (
                            <option key={c.id} value={c.id}>
                                {new Intl.NumberFormat('ar-SY').format(c.amount)} ل.س
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <SubmitButton />
            </div>

            {state?.message && state.message !== 'success' && state.message !== '' && (
                <div className="mt-4 text-red-600 bg-red-50 p-2 rounded text-sm font-bold">
                    {state.message}
                </div>
            )}
        </form>
    );
}
