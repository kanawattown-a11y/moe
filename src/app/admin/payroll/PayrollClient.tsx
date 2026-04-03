'use client';

import { useActionState, useState } from 'react';
import { CreditCard, Calculator, CheckCircle, Download, Search, AlertCircle, TrendingUp } from 'lucide-react';
import { generateSalaries, markAsPaid } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayrollClient({ records, summary }: any) {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generateSalaries(month, year);
            alert('تم توليد كشوف الرواتب بنجاح');
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8 font-cairo">
            
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <CreditCard className="text-primary" size={36} />
                        مسير الرواتب والأجور
                    </h1>
                    <p className="text-gray-400 mt-2 font-bold text-sm">إدارة المستحقات المالية الشهرية لكادر وزارة التربية</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="bg-transparent font-bold text-primary focus:outline-none px-2"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="bg-transparent font-bold text-primary focus:outline-none px-2 border-r border-gray-200"
                        >
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-primary text-white px-8 py-3 rounded-2xl font-black hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:bg-gray-400"
                    >
                        <Calculator size={20} />
                        {isGenerating ? 'جاري التوليد...' : 'توليد الكشوف'}
                    </button>
                    <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200">
                        <Download size={20} />
                        تصدير Excel
                    </button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">إجمالي الرواتب (هذا الشهر)</p>
                        <h3 className="text-3xl font-black text-gray-900 tabular-nums">
                            {Number(summary.totalExpenses).toLocaleString()} <small className="text-sm font-normal text-gray-400">ل.س</small>
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">تم صرفها</p>
                        <h3 className="text-3xl font-black text-gray-900 tabular-nums">
                            {String(summary.paidCount)} <small className="text-sm font-normal text-gray-400">موظف</small>
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1">قيد المعالجة</p>
                        <h3 className="text-3xl font-black text-gray-900 tabular-nums">
                            {String(summary.pendingCount)} <small className="text-sm font-normal text-gray-400">موظف</small>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-black text-xl text-gray-800">تفاصيل الكشوف الحالية</h3>
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="ابحث عن موظف..." 
                            className="bg-white border border-gray-200 rounded-2xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-white text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-5">الموظف</th>
                                <th className="px-8 py-5">الفترة</th>
                                <th className="px-8 py-5">الراتب الأساسي</th>
                                <th className="px-8 py-5">التعويضات / البدلات</th>
                                <th className="px-8 py-5">الاقتطاعات</th>
                                <th className="px-8 py-5">الصافي</th>
                                <th className="px-8 py-5 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {records.map((record: any) => (
                                    <motion.tr 
                                        key={String(record.id)}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50/50 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-black text-gray-900 group-hover:text-primary transition-colors">{record.employee.full_name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{record.employee.job_title_current?.name || 'موظف'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-500 tabular-nums">{record.month}/{record.year}</td>
                                        <td className="px-8 py-6 font-bold text-gray-700 tabular-nums">{Number(record.base_salary).toLocaleString()}</td>
                                        <td className="px-8 py-6 text-emerald-600 font-bold tabular-nums">+{Number(record.allowances).toLocaleString()}</td>
                                        <td className="px-8 py-6 text-rose-500 font-bold tabular-nums">-{Number(record.deductions).toLocaleString()}</td>
                                        <td className="px-8 py-6 font-black text-gray-900 text-lg tabular-nums">
                                            {Number(record.total).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            {record.is_paid ? (
                                                <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 justify-center w-32 border border-emerald-200">
                                                    <CheckCircle size={14} /> تم الصرف
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => markAsPaid(String(record.id) as any)}
                                                    className="bg-primary/5 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-primary/20 w-32"
                                                >
                                                    تأكيد الصرف
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <Calculator size={64} className="opacity-10" />
                                            <p className="font-bold">لا يوجد كشوف مولدة لهذه الفترة بعد.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}

