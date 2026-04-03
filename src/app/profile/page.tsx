import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { User, Briefcase, GraduationCap, MapPin, Calendar, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default async function ProfilePage() {
    const session = await auth();
    
    if (!session || !session.user) {
        redirect('/login');
    }

    const userId = Number(session.user.id);
    const user = await (prisma as any).user.findUnique({
        where: { id: userId },
        include: {
            employee: {
                include: {
                    school: true,
                    job_category: true,
                    job_title_current: true,
                    education_history: {
                        include: { certificate_type: true }
                    },
                    salary_records: {
                        orderBy: { created_at: 'desc' },
                        take: 5
                    }
                }
            }
        }
    });

    if (!user) notFound();

    const employee = user.employee;

    return (
        <div className="min-h-screen bg-gray-50/50 font-cairo" dir="rtl">
            {/* Header / Banner */}
            <div className="h-48 bg-gradient-to-r from-primary to-blue-900 shadow-lg"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Sidebar: Personal Info Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="p-8 text-center border-b border-gray-50 bg-gray-50/30">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg mx-auto overflow-hidden">
                                        <User className="w-16 h-16 text-primary" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                    </div>
                                </div>
                                <h2 className="mt-4 text-2xl font-bold text-gray-900">{employee?.full_name || user.username}</h2>
                                <p className="text-primary font-bold text-sm bg-primary/5 inline-block px-4 py-1 rounded-full mt-2">
                                    {user.role}
                                </p>
                            </div>

                            {employee && (
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold">الرقم الذاتي</p>
                                            <p className="text-sm text-gray-900 font-bold">{employee.self_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold">المسمى الوظيفي</p>
                                            <p className="text-sm text-gray-900 font-bold">{employee.job_title_current?.name || 'غير محدد'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold">مركز العمل</p>
                                            <p className="text-sm text-gray-900 font-bold">{employee.school?.name || 'الإدارة العامة'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!employee && (
                                <div className="p-8 text-center text-gray-500 italic text-sm">
                                    هذا الحساب غير مرتبط بملف موظف. يرجى مراجعة إدارة النظام.
                                </div>
                            )}
                        </div>

                        {/* Quick Stats or Actions */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                ملاحظات النظام
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                يمكنك من خلال هذه الصفحة الاطلاع على بياناتك الوظيفية وسجل الرواتب والقرارات الخاصة بك.
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {employee ? (
                            <>
                                {/* Detailed Info Tabs/Cards */}
                                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <GraduationCap className="w-6 h-6 text-primary" />
                                            المؤهلات العلمية
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {employee.education_history?.length > 0 ? (
                                            <div className="space-y-4">
                                                {employee.education_history.map((edu: any) => (
                                                    <div key={edu.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-gray-900">{edu.certificate_type?.name}</p>
                                                            <p className="text-sm text-gray-500">جامعة/معهد: {edu.university_id || 'غير معروف'}</p>
                                                        </div>
                                                        <div className="text-primary font-bold text-lg">
                                                            {edu.graduation_year}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-400 italic">لا توجد سجلات تعليمية مضافة.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Salary Records Preview */}
                                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <CreditCard className="w-6 h-6 text-emerald-600" />
                                            آخر مستحقات مالية
                                        </h3>
                                        <button className="text-emerald-600 text-sm font-bold hover:underline">
                                            عرض الكل
                                        </button>
                                    </div>
                                    <div className="p-6 overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead>
                                                <tr className="text-gray-400 text-sm border-b border-gray-100">
                                                    <th className="pb-4 font-bold">الفترة</th>
                                                    <th className="pb-4 font-bold">الأساسي</th>
                                                    <th className="pb-4 font-bold">الصافي</th>
                                                    <th className="pb-4 font-bold">الحالة</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employee.salary_records?.length > 0 ? (
                                                    employee.salary_records.map((record: any) => (
                                                        <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                                            <td className="py-4 font-bold text-gray-900">{record.month}/{record.year}</td>
                                                            <td className="py-4 text-gray-600 tabular-nums">{record.base_salary.toLocaleString()}</td>
                                                            <td className="py-4 text-primary font-black tabular-nums">{record.total.toLocaleString()}</td>
                                                            <td className="py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                    {record.is_paid ? 'تم الصرف' : 'قيد المعالجة'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="py-8 text-center text-gray-400 italic">لا توجد سجلات رواتب رقمية حالياً.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white p-12 rounded-3xl shadow-lg text-center space-y-6">
                                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                                    <Calendar className="w-12 h-12 text-rose-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">الملف غير مكتمل</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    لم يتم ربط حسابك بملف موظف رسمي حتى الآن. يرجى التواصل مع مسؤول شؤون العاملين لربط حسابك ليتم تفعيل كافة ميزات الخدمة الذاتية.
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

