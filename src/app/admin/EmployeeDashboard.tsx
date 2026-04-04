'use client';

import { motion } from 'framer-motion';
import { 
    User, 
    Building2, 
    Wallet, 
    Calendar, 
    Bell, 
    ArrowLeftRight, 
    TrendingUp,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard({ employee, lastSalary, activeLeaves }: any) {
    if (!employee) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    const fullName = `${employee.first_name} ${employee.last_name}`;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 font-cairo"
            dir="rtl"
        >
            {/* Header / Welcome Area */}
            <motion.div variants={itemVariants} className="bg-primary rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-black mb-4">مرحباً، {employee.first_name} 👋</h1>
                    <p className="text-blue-200 text-lg max-w-2xl opacity-90">
                        أهلاً بك في البوابة الذاتية لنظام وزارة التربية. يمكنك هنا متابعة بياناتك الوظيفية، الرواتب، وتقديم طلبات الإجازة.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                            <ShieldCheck size={24} className="text-emerald-400" />
                            <span className="font-bold">{employee.work_status?.name || 'نشط'}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                            <Building2 size={24} className="text-blue-300" />
                            <span className="font-bold">{employee.school?.name || 'الإدارة العامة'}</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative background shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Financial Overview */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 lg:col-span-1">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <Wallet className="text-blue-600" size={24} />
                            آخر راتب مصروف
                        </h3>
                    </div>

                    {lastSalary ? (
                        <div className="space-y-6">
                            <div className="text-center py-6 bg-blue-50 rounded-3xl">
                                <span className="text-4xl font-black text-primary tabular-nums">
                                    {Number(lastSalary.net_salary).toLocaleString('ar-EG')}
                                </span>
                                <span className="text-sm font-bold text-gray-500 block mt-1">ليرة سورية</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">الشهر</span>
                                    <span className="font-black text-gray-800">{lastSalary.month} / {lastSalary.year}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left" dir="ltr">
                                    <Link href="/admin/payroll" className="text-xs font-bold text-blue-600 hover:underline">
                                        التفاصيل &larr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 italic">
                            لا توجد سجلات رواتب مسجلة بعد.
                        </div>
                    )}
                </motion.div>

                {/* Employment Details */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-50 lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <Briefcase className="text-accent" size={24} />
                            تفاصيل الحالة الوظيفية
                        </h3>
                        <Link href="/admin/employees" className="text-blue-600 font-bold text-sm hover:underline">عرض الملف الكامل</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                                <User size={24} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-bold">المسمى الوظيفي</span>
                                <span className="font-bold text-gray-800">{employee.job_title_current?.name || 'موظف تعليمي'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-bold">الفئة الوظيفية</span>
                                <span className="font-bold text-gray-800">الفئة الأولى (قريباً)</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-bold">تاريخ التعيين</span>
                                <span className="font-bold text-gray-800">12/05/2015</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-sm">
                                <ArrowLeftRight size={24} />
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block font-bold">الملاك الحالي</span>
                                <span className="font-bold text-gray-800">{employee.school?.name || 'ملاك الوزارة'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Bottom Row - Leaves & Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Leaves */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
                    <div className="px-8 py-7 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <Calendar className="text-emerald-500" size={24} />
                            آخر طلبات الإجازة
                        </h3>
                        <Link href="/admin/vacations" className="text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">عرض الكل</Link>
                    </div>
                    <div className="p-8 space-y-4">
                        {activeLeaves.length > 0 ? (
                            activeLeaves.map((leave: any) => (
                                <div key={String(leave.id)} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 bg-emerald-400 rounded-full"></div>
                                        <div>
                                            <p className="font-bold text-gray-900">{leave.leave_type}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(leave.start_date).toLocaleDateString('ar-SY')}</p>
                                        </div>
                                    </div>
                                    <div className="text-left font-bold text-gray-500">
                                        {leave.duration} يوم
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">لا توجد طلبات إجازة مسجلة.</div>
                        )}
                    </div>
                </motion.div>

                {/* Support & Quick Actions */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-accent/10 to-transparent rounded-[2.5rem] p-8 border border-accent/20">
                    <h3 className="font-bold text-xl text-gray-800 mb-8">روابط سريعة</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/notifications" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Bell size={24} /></div>
                            <span className="font-bold text-gray-700">الإشعارات</span>
                        </Link>
                        <Link href="/admin/books" className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><BookOpenIcon size={24} /></div>
                            <span className="font-bold text-gray-700">المكتبة</span>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
}

function BookOpenIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}
