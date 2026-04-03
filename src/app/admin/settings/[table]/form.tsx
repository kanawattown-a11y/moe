'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createItem } from '@/app/admin/settings/actions';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50 flex items-center gap-2"
        >
            {pending ? 'جاري الحفظ...' : 'إضافة'}
            <span>+</span>
        </button>
    );
}

type State = {
    message: string;
    errors?: {
        name?: string[];
    };
};

export default function AddItemForm({ tableSlug, metaTable, isSystem, config }: { tableSlug: string, metaTable?: any, isSystem?: boolean, config?: any }) {
    const [state, dispatch] = useActionState(createItem.bind(null, tableSlug), { message: '', errors: {} } as State);
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
            <h3 className="font-bold text-gray-800 mb-4 text-lg">إضافة عنصر جديد</h3>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Static Field for System Tables */}
                    {isSystem && config && (
                        <div className="flex-grow">
                            <label className="block text-sm font-bold text-gray-900 mb-1">الاسم / البيان الأساسي</label>
                            <input
                                name={config.nameField || 'name'}
                                type="text"
                                required
                                placeholder="أدخل البيان هنا..."
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:border-primary focus:ring-0 focus:outline-none transition placeholder:text-gray-400"
                            />
                            {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}
                        </div>
                    )}

                    {/* 2. Dynamic Fields from Builder */}
                    {metaTable && metaTable.fields && metaTable.fields.map((field: any) => (
                        <div key={field.id} className="flex-grow">
                            <label className="block text-sm font-bold text-gray-900 mb-1">{field.label}</label>

                            {field.inputType === 'textarea' ? (
                                <textarea name={field.name} required={field.isRequired} rows={3} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:border-primary focus:ring-0 focus:outline-none transition"></textarea>
                            ) : field.inputType === 'select' ? (
                                <select name={field.name} required={field.isRequired} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:border-primary focus:ring-0 focus:outline-none transition bg-white">
                                    <option value="">اختر...</option>
                                    {field.options?.split(',').map((opt: string) => (
                                        <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                    ))}
                                </select>
                            ) : field.inputType === 'radio' ? (
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {field.options?.split(',').map((opt: string) => (
                                        <label key={opt.trim()} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition shadow-sm">
                                            <input type="radio" name={field.name} value={opt.trim()} required={field.isRequired} className="text-primary focus:ring-primary w-4 h-4" />
                                            <span className="text-sm font-bold text-gray-900">{opt.trim()}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : field.inputType === 'checkbox' || field.type === 'Boolean' ? (
                                <div className="flex items-center gap-2 h-10">
                                    <input type="checkbox" name={field.name} defaultChecked={false} className="w-5 h-5 rounded border-gray-400 text-primary focus:ring-primary" />
                                    <span className="text-sm font-bold text-gray-900">نعم / فعال</span>
                                </div>
                            ) : field.inputType === 'file' ? (
                                <input type="file" name={field.name} required={field.isRequired} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:border-primary focus:ring-0 focus:outline-none transition bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            ) : (
                                <input
                                    name={field.name}
                                    type={field.inputType === 'time' ? 'time' : field.type === 'Int' ? 'number' : field.type === 'DateTime' ? 'date' : 'text'}
                                    required={field.isRequired}
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:border-primary focus:ring-0 focus:outline-none transition"
                                />
                            )}
                        </div>
                    ))}

                    {/* Fallback for System Tables without metaTable configured yet */}
                    {isSystem && !metaTable && !config && (
                        <div className="flex-grow">
                            <label className="block text-sm font-bold text-gray-900 mb-1">الاسم</label>
                            <input name="name" type="text" required placeholder="أدخل الاسم هنا..." className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 font-bold focus:border-primary focus:ring-0 focus:outline-none transition" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-2">
                    <SubmitButton />
                </div>
            </div>

            {state?.message && state.message !== 'success' && state.message !== '' && (
                <div className="mt-3 text-red-600 bg-red-50 p-2 rounded text-sm font-bold">
                    {state.message}
                </div>
            )}
        </form>
    );
}
