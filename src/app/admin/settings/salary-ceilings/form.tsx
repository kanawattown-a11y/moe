'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createSalaryCeiling } from './actions';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center gap-2 mt-4 md:mt-0"
        >
            {pending ? 'جاري الحفظ...' : 'إضافة'}
            <span>+</span>
        </button>
    );
}

const initialState = {
    message: '',
    errors: {} as { amount?: string[], job_category_id?: string[] }
};

export default function AddItemForm({ jobCategories }: { jobCategories: any[] }) {
    const [state, dispatch] = useActionState(createSalaryCeiling, initialState);
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
            <h3 className="font-bold text-gray-800 mb-4 text-lg">إضافة سقف أجر جديد</h3>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-grow w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">السقف (المبلغ)</label>
                    <input
                        name="amount"
                        type="number"
                        placeholder="مثال: 1500000"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-primary font-bold tracking-widest focus:border-accent focus:ring-0 focus:outline-none transition"
                        required
                        min="1"
                        step="1"
                    />
                    {state?.errors?.amount && <p className="text-red-500 text-sm mt-1">{state.errors.amount}</p>}
                </div>

                <div className="flex-grow w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الفئة الوظيفية</label>
                    <select
                        name="job_category_id"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-gray-700 bg-white focus:border-accent focus:ring-0 focus:outline-none transition cursor-pointer"
                        required
                        defaultValue=""
                    >
                        <option value="" disabled>اختر الفئة الوظيفية...</option>
                        {jobCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name || `فئة ${cat.id}`}</option>
                        ))}
                    </select>
                    {state?.errors?.job_category_id && <p className="text-red-500 text-sm mt-1">{state.errors.job_category_id}</p>}
                </div>

                <div className="w-full md:w-auto flex justify-end">
                    <SubmitButton />
                </div>
            </div>
            {state?.message && state.message !== 'success' && state.message !== '' && (
                <div className="mt-4 text-red-600 bg-red-50 p-2 rounded text-sm font-bold">
                    {state.message}
                </div>
            )}
        </form>
    );
}
