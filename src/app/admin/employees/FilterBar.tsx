'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Filter, X, ChevronDown, Download } from 'lucide-react';
import { exportEmployeesCSV } from './actionsExport';

export default function FilterBar({ schools, statuses }: { schools: any[], statuses: any[] }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    const handleExport = async () => {
        const filters = {
            school_id: searchParams.get('school_id') ? Number(searchParams.get('school_id')) : undefined,
            status_id: searchParams.get('status_id') ? Number(searchParams.get('status_id')) : undefined,
            gender: searchParams.get('gender') || undefined,
            q: searchParams.get('q') || undefined,
        };

        const csv = await exportEmployeesCSV(filters);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        startTransition(() => {
            replace(pathname);
        });
    };

    const hasFilters = searchParams.get('school_id') || searchParams.get('status_id') || searchParams.get('gender') || searchParams.get('q');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                
                {/* School Filter */}
                <div className="relative flex-1 w-full">
                    <select
                        value={searchParams.get('school_id') || ''}
                        onChange={(e) => updateFilter('school_id', e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-accent transition-all appearance-none"
                    >
                        <option value="">كل المدارس / المجمعات</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Status Filter */}
                <div className="relative w-full md:w-48">
                    <select
                        value={searchParams.get('status_id') || ''}
                        onChange={(e) => updateFilter('status_id', e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-accent transition-all appearance-none"
                    >
                        <option value="">كل الحالات</option>
                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* Gender Filter */}
                <div className="relative w-full md:w-40">
                    <select
                        value={searchParams.get('gender') || ''}
                        onChange={(e) => updateFilter('gender', e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-accent transition-all appearance-none"
                    >
                        <option value="">الكل (ذكر/أنثى)</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {hasFilters && (
                    <button 
                        onClick={clearFilters}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm"
                    >
                        <X size={18} /> مسح
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Filter size={14} />
                    <span>تصفية متقدمة</span>
                    {isPending && <div className="w-1 h-1 rounded-full bg-accent animate-ping"></div>}
                </div>
                
                <button 
                    onClick={handleExport}
                    className="text-primary hover:text-primary/80 font-black text-sm flex items-center gap-2 group"
                >
                    <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    تصدير البيانات (CSV)
                </button>
            </div>
        </div>
    );
}
