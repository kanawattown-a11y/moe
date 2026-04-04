'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    DollarSign, 
    Calendar, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    FileText, 
    Printer,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface PayrollRecord {
    id: string;
    month: number;
    year: number;
    base_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    is_payout: boolean;
    created_at?: string;
}

interface PersonalPayrollViewProps {
    records: PayrollRecord[];
    employeeName: string;
}

export default function PersonalPayrollView({ records, employeeName }: PersonalPayrollViewProps) {
    const latestRecord = records[0];
    
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    } as const;

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    } as const;

    return (
        <div className="max-w-5xl mx-auto space-y-8 font-cairo" dir="rtl">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">كشف الرواتب والمستحقات</h1>
                    <p className="text-gray-500 mt-2 font-bold italic">بوابة العرض الشخصية: {employeeName}</p>
                </div>
                <div className="flex bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-gray-400 font-mono italic">حالة الدفع: منتظم</span>
                    </div>
                </div>
            </header>

            {latestRecord ? (
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-8"
                >
                    {/* Main Net Salary Card */}
                    <motion.div variants={item} className="bg-gradient-to-br from-primary to-blue-700 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <DollarSign size={240} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-4 bg-white/10 w-fit px-5 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                    <Calendar size={18} className="text-blue-200" />
                                    <span className="text-sm font-black text-blue-50">آخر راتب: شهر {latestRecord.month} / {latestRecord.year}</span>
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-blue-200 uppercase tracking-[0.2em] mb-2 opacity-80">صافي المستحق النهائي لهذا الشهر</h2>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-7xl font-black tracking-tighter drop-shadow-lg">{latestRecord.net_salary.toLocaleString()}</span>
                                        <span className="text-2xl font-black text-blue-200">ل.س</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none bg-white text-primary px-10 py-4 rounded-[1.5rem] font-black text-sm hover:translate-y-[-2px] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                                    <Printer size={20} />
                                    طباعة القسيمة
                                </button>
                                <button className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 border border-white/10 active:scale-95">
                                    <FileText size={20} />
                                    عرض التفاصيل
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={item} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <DollarSign size={28} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-1">الراتب الأساسي المقطوع</p>
                                <p className="text-2xl font-black text-gray-900">{latestRecord.base_salary.toLocaleString()} <span className="text-sm text-gray-400 font-bold ml-1">ل.س</span></p>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                <ArrowUpCircle size={28} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-1">مجموع التعويضات والمكافآت</p>
                                <p className="text-2xl font-black text-emerald-600">+{latestRecord.allowances.toLocaleString()} <span className="text-sm text-gray-400 font-bold ml-1">ل.س</span></p>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                                <ArrowDownCircle size={28} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-wider mb-1">مجموع الاقتطاعات والضرائب</p>
                                <p className="text-2xl font-black text-rose-600">-{latestRecord.deductions.toLocaleString()} <span className="text-sm text-gray-400 font-bold ml-1">ل.س</span></p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            ) : (
                <div className="bg-white rounded-[3rem] p-20 text-center flex flex-col items-center justify-center border border-dashed border-gray-200">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <DollarSign size={40} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">لا يوجد سجلات مالية</h3>
                    <p className="text-gray-400 font-bold">لم يتم العثور على أي كشوفات رواتب مسجلة باسمك حالياً.</p>
                </div>
            )}

            {/* History Table */}
            {records.length > 0 && (
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                >
                    <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            الأرشيف المالي (دفعات سابقة)
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto px-4 pb-4">
                        <table className="w-full text-right border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-gray-400 text-[10px] font-black tracking-[0.2em] uppercase">
                                    <th className="p-6">الفترة الزمنية</th>
                                    <th className="p-6">الصافي المودع</th>
                                    <th className="p-6">حالة العملية</th>
                                    <th className="p-6">تاريخ الإيداع</th>
                                    <th className="p-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => (
                                    <tr key={record.id} className="group hover:scale-[1.01] transition-all duration-300">
                                        <td className="p-6 bg-gray-50/50 rounded-r-[1.5rem] first:rounded-r-[1.5rem] group-hover:bg-white border-y border-r border-transparent group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-gray-200/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1rem] bg-white shadow-sm border border-gray-100 flex items-center justify-center font-black text-xs text-gray-600 group-hover:bg-primary group-hover:text-white transition-all">
                                                    {record.month}/{record.year.toString().slice(-2)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">شهر {record.month}</p>
                                                    <p className="text-[10px] text-gray-400 font-black">{record.year}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 bg-gray-50/50 group-hover:bg-white border-y border-transparent group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-gray-200/50">
                                            <span className="text-xl font-black text-primary tracking-tight">
                                                {record.net_salary.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-black mr-2 tracking-normal">ل.س</span>
                                        </td>
                                        <td className="p-6 bg-gray-50/50 group-hover:bg-white border-y border-transparent group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-gray-200/50">
                                            {record.is_payout ? (
                                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-4 py-1.5 rounded-full text-[10px] font-black border border-emerald-100">
                                                    <CheckCircle2 size={12} />
                                                    تم إيداع الراتب بنجاح
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 w-fit px-4 py-1.5 rounded-full text-[10px] font-black border border-amber-100">
                                                    <Clock size={12} />
                                                    جارٍ المعالجة البنكية
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 bg-gray-50/50 group-hover:bg-white border-y border-transparent group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-gray-200/50 text-sm text-gray-500 font-mono font-bold">
                                            {record.created_at ? new Date(record.created_at).toLocaleDateString('ar-SY') : '-'}
                                        </td>
                                        <td className="p-6 bg-gray-50/50 rounded-l-[1.5rem] group-hover:bg-white border-y border-l border-transparent group-hover:border-gray-100 group-hover:shadow-lg group-hover:shadow-gray-200/50">
                                            <div className="flex justify-center">
                                                <button className="h-10 w-10 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center">
                                                    <Printer size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
