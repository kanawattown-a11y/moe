'use client';

import { motion } from 'framer-motion';
import { Users, School, Newspaper, BookOpen, Clock, TrendingUp, AlertTriangle, Briefcase, Award } from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#1e3a8a', '#c5b358', '#0ea5e9', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'];

export default function AdminDashboardClient({ metrics, statusCounts, genderCounts, categoryCounts, recentEmployees }: any) {

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

    const statCards = [
        { title: 'إجمالي الموظفين', value: metrics.employeeCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'المدارس التابعة', value: metrics.schoolCount, icon: School, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'موظفون نحو التقاعد', value: metrics.upcomingRetirements, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', sub: 'فوق سن الستين' },
        { title: 'الكتب الإلكترونية', value: metrics.bookCount, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants} className="bg-white rounded-[2rem] p-7 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6 hover:translate-y-[-4px] transition-all duration-300">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                            <stat.icon size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-black text-gray-900 tabular-nums">
                                {Number(stat.value).toLocaleString('ar-EG')}
                            </h3>
                            {stat.sub && <p className="text-[10px] font-bold text-rose-400 mt-1">{stat.sub}</p>}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
                
                {/* Gender Ratio (Pie) */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 lg:col-span-1 min-w-0">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                            التركيبة السكانية
                        </h3>
                    </div>
                    <div className="h-72 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderCounts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {genderCounts.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={String(entry.name || '').includes('أنثى') ? '#ec4899' : '#3b82f6'} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 text-center" dir="rtl">
                            <span className="text-4xl font-black text-gray-900">{String(metrics.employeeCount)}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">إجمالي الكادر</span>
                        </div>
                    </div>
                </motion.div>

                {/* Job Category Distribution */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 lg:col-span-2 min-w-0">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <div className="w-2 h-8 bg-accent rounded-full"></div>
                            توزيع الفئات الوظيفية
                        </h3>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryCounts} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#c5b358" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#c5b358" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis hide />
                                <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                                <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row - Activity & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Activities */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="px-8 py-7 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                            <Clock className="text-gray-400" size={24} /> 
                            آخر المضافين للنظام
                        </h3>
                        <Award className="text-accent/40" size={32} />
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-right">
                            <tbody className="divide-y divide-gray-50">
                                {recentEmployees.map((emp: any) => (
                                    <tr key={String(emp.id)} className="group hover:bg-gray-50 transition-all duration-300">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
                                                    {emp.first_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-xs text-gray-400 font-bold">{emp.school?.name || 'الإدارة العامة'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            <span className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                {emp.job_title_current?.name || 'موظف'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Status List (Vertical Visual) */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <h3 className="font-bold text-xl text-gray-800 mb-8 flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" size={24} />
                        حالات الكادر الوظيفي
                    </h3>
                    <div className="space-y-6">
                        {statusCounts.map((item: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-gray-600">{item.name}</span>
                                    <span className="text-gray-900">{String(item.value)}</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / metrics.employeeCount) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>

        </motion.div>
    );
}
