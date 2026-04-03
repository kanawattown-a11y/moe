import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Check, X, Users, UserPlus } from 'lucide-react';
import { approveTeacher, rejectTeacher } from './actions';

export default async function ApprovalsPage() {
    // Use raw SQL to bypass PrismaClientValidationError until dev server restarts
    // Note: Found that the actual internal table name is "جدول_الذاتيات"
    const pendingTeachers = await prisma.$queryRaw`
        SELECT * FROM "جدول_الذاتيات" 
        WHERE "تم_الموافقة" = false 
        ORDER BY "معرف_الموظف" DESC
    ` as any[];

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">طلبات تسجيل المدرسين</h1>
                <p className="text-sm md:text-base text-gray-500 mt-2">مراجعة والتحقق من بيانات المدرسين الجدد قبل منحهم صلاحية الوصول</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingTeachers.map((teacher: any) => (
                    <div key={teacher.معرف_الموظف} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                        {/* Profile Header */}
                        <div className="h-24 bg-primary relative">
                            <div className="absolute -bottom-10 right-6 w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-gray-100 shadow-sm">
                                {teacher.رابط_الصورة_الشخصية ? (
                                    <Image 
                                        src={teacher.رابط_الصورة_الشخصية} 
                                        alt="profile" 
                                        fill 
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                        <Users size={32} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pt-12 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {teacher.الاسم} {teacher.النسبة}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">{teacher.اسم_الأب && `ابن ${teacher.اسم_الأب}`}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">الرقم الوطني:</span>
                                    <span className="font-bold text-gray-700">{String(teacher.الرقم_الوطني || '-')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">رقم الهاتف:</span>
                                    <span className="font-bold text-gray-700">{String(teacher.الموبايل || '-')}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <form action={async () => { 
                                    'use server'; 
                                    const usernameCandidate = teacher.الموبايل || teacher.الرقم_الوطني || `teacher_${teacher.معرف_الموظف}`;
                                    await approveTeacher(teacher.معرف_الموظف, usernameCandidate); 
                                }} className="flex-1">
                                    <button 
                                        type="submit"
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                                    >
                                        <Check size={18} />
                                        موافقة واعتماد
                                    </button>
                                </form>

                                <form action={async () => { 
                                    'use server'; 
                                    await rejectTeacher(teacher.معرف_الموظف); 
                                }} className="shrink-0">
                                    <button 
                                        type="submit"
                                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-100 transition"
                                        title="رفض الطلب"
                                    >
                                        <X size={20} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">انتظار الموافقة</span>
                            <span className="text-[10px] font-mono text-gray-300">ID: {teacher.معرف_الموظف}</span>
                        </div>
                    </div>
                ))}

                {pendingTeachers.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 opacity-50">
                            <UserPlus size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">لا توجد طلبات معلقة</h3>
                        <p className="text-gray-500">عندما يقوم المدرسون بالتسجيل عبر النموذج العام، ستظهر طلباتهم هنا للمراجعة.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
