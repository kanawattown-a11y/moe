'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addVisaAudit } from './actions';

export default function VisaAuditForm({ employeeId }: { employeeId: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function action(formData: FormData) {
        setLoading(true);
        setError('');
        const res = await addVisaAudit(employeeId, formData);
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع وقرار الترفيع</label>
                    <input type="text" name="promotion_decision_name" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم قرار الترفيع</label>
                    <input type="text" name="promotion_decision_num" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ قرار الترفيع</label>
                    <input type="date" name="promotion_decision_date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم قرار التأشير</label>
                    <input type="text" name="visa_decision_num" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ التأشير</label>
                    <input type="date" name="visa_decision_date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات والتأشيرات</label>
                <textarea name="notes" rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"></textarea>
            </div>

            <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-bold">
                    إلغاء
                </button>
                <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition shadow-sm font-bold disabled:opacity-70">
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
            </div>
        </form>
    );
}
