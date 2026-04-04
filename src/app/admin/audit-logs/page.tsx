import { getAuditLogs } from '@/services/audit-service';
import { Shield, User, Activity, Clock, FileText, Search } from 'lucide-react';

export default async function AuditLogsPage() {
    const logs = await getAuditLogs();

    return (
        <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen font-cairo" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Shield className="text-primary" size={32} />
                        <span>سجل النشاطات (Audit Logs)</span>
                    </h1>
                    <p className="text-gray-500 mt-2">مراقبة جميع التعديلات والعمليات الحساسة في النظام</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="إجمالي العمليات" value={logs.length} icon={<Activity size={24} />} color="blue" />
                <StatCard label="آخر عملية" value={logs[0] ? new Date(logs[0].created_at).toLocaleTimeString('ar-SY') : '-'} icon={<Clock size={24} />} color="emerald" />
                <StatCard label="مستوى الأمان" value="مرتفع" icon={<Shield size={24} />} color="purple" />
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                        <tr>
                            <th className="p-5">المستخدم</th>
                            <th className="p-5">العملية</th>
                            <th className="p-5">الكيان</th>
                            <th className="p-5">التفاصيل</th>
                            <th className="p-5">الوقت والتاريخ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log: any) => (
                            <tr key={String(log.id)} className="hover:bg-blue-50/40 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                            {log.user?.username?.charAt(0) || <User size={14} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{log.user?.username || 'نظام'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{log.user?.role || 'SYSTEM'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-5 font-bold text-gray-700 text-sm">
                                    {log.resource}
                                </td>
                                <td className="p-5 text-gray-500 text-xs max-w-xs truncate">
                                    {typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || '-')}
                                </td>
                                <td className="p-5 text-gray-500 text-xs font-mono">
                                    {new Date(log.created_at).toLocaleString('ar-SY')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic">
                        لا توجد سجلات حالياً.
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600"
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold mb-1">{label}</p>
                <p className="text-xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function getActionColor(action: string) {
    switch (action) {
        case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'DELETE': return 'bg-red-50 text-red-700 border-red-100';
        case 'LOGIN': return 'bg-purple-50 text-purple-700 border-purple-100';
        default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
}
