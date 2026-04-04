'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUser } from '@/app/admin/actions';
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
            {pending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
    );
}

type State = {
    message: string | null;
    errors?: {
        role?: string[];
        password?: string[];
    };
};

export default function EditUserForm({ user, employeeOptions = [] }: { user: any, employeeOptions?: any[] }) {
    const updateUserWithId = updateUser.bind(null, Number(user.id));
    const [state, dispatch] = useActionState(updateUserWithId, { message: null, errors: {} } as State);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <form action={dispatch} className="space-y-6">

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-bold text-gray-500 mb-2">اسم المستخدم</label>
                    <div className="text-gray-900 font-bold text-lg">{user.username}</div>
                    <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير اسم المستخدم</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <input
                        name="password"
                        type="password"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                        placeholder="اتركها فارغة إذا كنت لا تريد التغيير"
                    />
                    <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل في حال التغيير</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الدور (الصلاحية)</label>
                    <SearchableSelect
                        name="role"
                        defaultValue={user.role}
                        options={[
                            { value: 'ADMIN', label: 'مدير نظام (Admin)' },
                            { value: 'TEACHER', label: 'مستخدم مدرسة (Teacher)' },
                            { value: 'EMPLOYEE', label: 'مستخدم شؤون عاملين (Employee)' },
                            { value: 'USER', label: 'مستخدم عادي (User)' }
                        ]}
                    />
                    {state?.errors?.role && <p className="text-red-500 text-sm mt-1">{state.errors.role}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ربط بملف موظف (اختياري)</label>
                    <SearchableSelect
                        name="employeeId"
                        defaultValue={user.linked_employee_id}
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
                        ].map((perm) => {
                            // user.permissions should be an array of strings if it exists
                            const hasPermission = Array.isArray(user.permissions) && user.permissions.includes(perm.value);
                            return (
                                <div key={perm.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="permissions"
                                        id={`perm_${perm.id}`}
                                        value={perm.value}
                                        defaultChecked={hasPermission}
                                        className="w-4 h-4 text-accent rounded focus:ring-accent"
                                    />
                                    <label htmlFor={`perm_${perm.id}`} className="text-sm text-gray-700">{perm.label}</label>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        defaultChecked={user.is_active}
                        className="w-5 h-5 text-accent rounded focus:ring-accent"
                    />
                    <label htmlFor="is_active" className="text-gray-700 font-bold">حساب فعال</label>
                </div>

                {state?.message && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                        {state.message}
                    </div>
                )}

                <div className="pt-4 flex justify-between items-center">
                    <Link href="/admin/users" className="text-gray-500 hover:text-gray-700">
                        إلغاء الأمر
                    </Link>
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
