'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createSchool } from '../actions';
import { Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg disabled:bg-gray-400 flex items-center gap-2"
        >
            {pending ? 'جاري الحفظ...' : 'حفظ المدرسة'}
        </button>
    );
}

type State = {
    message: string;
    errors?: {
        name?: string[];
        city_id?: string[];
        stat_num?: string[];
        village_id?: string[];
        stage?: string[];
        phone?: string[];
        education_type?: string[];
    };
};

export default function NewSchoolPage({ cities, villages }: { cities: any[], villages: any[] }) {
    const [state, dispatch] = useActionState(createSchool, { message: "", errors: {} } as State);

    return (
        <div className="p-6 max-w-4xl mx-auto font-cairo" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">إضافة مدرسة جديدة</h1>
                <Link href="/admin/schools" className="text-gray-500 hover:text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    &larr; إلغاء وعودة
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <form action={dispatch} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المدرسة <span className="text-red-500">*</span></label>
                            <input
                                name="name"
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-bold"
                                placeholder="مثال: مدرسة المتفوقين الأولى..."
                            />
                            {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الرقم الإحصائي</label>
                            <input
                                name="stat_number"
                                type="number"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                            <input
                                name="phone"
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المدينة / الناحية <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                name="city_id"
                                options={cities.map(c => ({ value: c.id, label: c.name }))}
                            />
                            {state?.errors?.city_id && <p className="text-red-500 text-sm mt-1">{state.errors.city_id}</p>}
                        </div>

                        {/* Village */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">اسم القرية / البلدة</label>
                            <SearchableSelect
                                name="village_id"
                                options={villages.map(v => ({ value: v.id, label: v.name }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">المرحلة الدراسية</label>
                            <SearchableSelect
                                name="phase"
                                options={[
                                    { value: "", label: "غير محدد" },
                                    { value: "ابتدائية", label: "ابتدائية (حلقة أولى)" },
                                    { value: "اعدادية", label: "اعدادية (حلقة ثانية)" },
                                    { value: "ثانوية", label: "ثانوية" },
                                    { value: "مختلطة", label: "مختلطة" },
                                    { value: "روضة", label: "روضة" }
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">نوع التعليم</label>
                            <select name="education_type" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent bg-white">
                                <option value="">غير محدد</option>
                                <option value="عام">عام</option>
                                <option value="مهني">مهني</option>
                                <option value="خاص">خاص</option>
                            </select>
                        </div>
                    </div>

                    {state?.message && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-bold flex items-center gap-2">
                            <span>⚠️</span> {state.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end border-t border-gray-100">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
