'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addWeeklyQuota } from './actions';

export default function WeeklyQuotaForm({ employeeId, schools, complexes }: { employeeId: number, schools: any[], complexes: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function action(formData: FormData) {
        setLoading(true);
        setError('');
        const res = await addWeeklyQuota(employeeId, formData);
        if (res.success) {
            router.push(`/admin/employees/${employeeId}`);
        } else {
            setError(res.error || 'حدث خطأ');
            setLoading(false);
        }
    }

    return (
        <form action={action} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 font-bold">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المجمع التربوي (اختياري)</label>
                    <select name="educational_complex_id" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
                        <option value="">اختر المجمع...</option>
                        {complexes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المدرسة (اختياري)</label>
                    <select name="school_id" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
                        <option value="">اختر المدرسة...</option>
                        {schools.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">عدد الساعات</label>
                    <input type="number" name="hours" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" min="0" />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input type="checkbox" id="is_additional" name="is_additional" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="is_additional" className="text-sm font-bold text-gray-700">تكليف بساعات إضافية (خارج أوقات الدوام أو نصاب إضافي)</label>
            </div>

            <div className="flex justify-end gap-4 mt-4 border-t border-gray-100 pt-6">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-bold">
                    إلغاء
                </button>
                <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition shadow-sm font-bold disabled:opacity-70">
                    {loading ? 'جاري الحفظ...' : 'إضافة النصاب'}
                </button>
            </div>
        </form>
    );
}
