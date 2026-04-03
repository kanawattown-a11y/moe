'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createUser } from '@/app/admin/actions';
import { Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition shadow-md disabled:bg-gray-400"
        >
            {pending ? 'جاري الحفظ...' : 'حفظ المستخدم'}
        </button>
    );
}

type State = {
    message: string | null;
    errors?: {
        username?: string[];
        password?: string[];
        role?: string[];
    };
};

export default function NewUserForm({ employeeOptions }: { employeeOptions: any[] }) {
    const [state, dispatch] = useActionState(createUser, { message: null, errors: {} } as State);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <form action={dispatch} className="space-y-6">

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                    <input
                        name="username"
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                        placeholder="مثال: teacher1"
                    />
                    {state?.errors?.username && <p className="text-red-500 text-sm mt-1">{state.errors.username}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                    <input
                        name="password"
                        type="password"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                        placeholder="******"
                    />
                    {state?.errors?.password && <p className="text-red-500 text-sm mt-1">{state.errors.password}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الدور (الصلاحية)</label>
                    <SearchableSelect
                        name="role"
                        options={[
                            { value: 'ADMIN', label: 'مدير نظام (Admin)' },
                            { value: 'TEACHER', label: 'مستخدم مدرسة (Teacher)' },
                            { value: 'EMPLOYEE', label: 'مستخدم شؤون عاملين (Employee)' },
                            { value: 'USER', label: 'مستخدم عادي (User)' }
                        ]}
                        placeholder="اختر الدور..."
                    />
                    {state?.errors?.role && <p className="text-red-500 text-sm mt-1">{state.errors.role}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ربط بملف موظف (اختياري)</label>
                    <SearchableSelect
                        name="employeeId"
                        options={employeeOptions}
                        placeholder="ابحث عن موظف..."
                    />
                    <p className="text-xs text-gray-500 mt-1">يُربط هذا الحساب ببيانات الموظف لتفنيذ الخدمة الذاتية.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الصلاحيات المخصصة (اختياري)</label>
                    <p className="text-xs text-gray-500 mb-3">تُستخدم لإعطاء صلاحيات محددة لصفحات معينة إذا كان المستخدم ليس مدير نظام عام.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {[
                            { id: 'students', label: 'إدارة الطلاب المستجدين (قريباً)', value: '/admin/students' },
                            { id: 'news', label: 'إدارة الأخبار', value: '/admin/news' },
                            { id: 'schools', label: 'إدارة المدارس', value: '/admin/schools' },
                            { id: 'library', label: 'المكتبة الرقمية', value: '/admin/books' },
                            { id: 'settings', label: 'إعدادات النظام (البيانات الأساسية)', value: '/admin/settings' },
                            { id: 'users', label: 'إدارة المستخدمين', value: '/admin/users' },
                            { id: 'vacations', label: 'إدارة الإجازات', value: '/admin/vacations' },
                            { id: 'promotions', label: 'إدارة الترفيعات', value: '/admin/promotions' },
                            { id: 'movements', label: 'الندب والإيفاد', value: '/admin/movements' },
                            { id: 'terminations', label: 'إجراءات ترك العمل', value: '/admin/terminations' },
                        ].map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="permissions"
                                    id={`perm_${perm.id}`}
                                    value={perm.value}
                                    className="w-4 h-4 text-accent rounded focus:ring-accent"
                                />
                                <label htmlFor={`perm_${perm.id}`} className="text-sm text-gray-700">{perm.label}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" name="is_active" id="is_active" defaultChecked className="w-5 h-5 text-accent rounded focus:ring-accent" />
                    <label htmlFor="is_active" className="text-gray-700 font-bold">حساب فعال</label>
                </div>

                {state?.message && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                        {state.message}
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
