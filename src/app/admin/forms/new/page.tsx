import { prisma } from '@/lib/prisma';
import NewCustomForm from './form';
import { Settings } from 'lucide-react';

export default async function NewCustomFormPage() {
    const metaTables = await prisma.metaTable.findMany({
        orderBy: { title: 'asc' }
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="mb-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إنشاء نموذج جديد</h1>
                    <p className="text-gray-500 mt-2">قم بتهيئة النموذج الأساسي قبل الانتقال لشاشة التصميم</p>
                </div>
            </div>

            <div className="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <NewCustomForm tables={metaTables} />
            </div>
        </div>
    );
}
