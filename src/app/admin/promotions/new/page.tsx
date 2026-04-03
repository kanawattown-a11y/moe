import { prisma } from '@/lib/prisma';
import PromotionForm from './form';

export default async function NewPromotionPage() {
    // Fetch all employees for the dropdown
    const employees = await prisma.employee.findMany({
        select: {
            id: true,
            first_name: true,
            last_name: true,
            national_id: true,
            job_title_current: {
                select: { name: true }
            }
        },
        orderBy: {
            first_name: 'asc'
        }
    });

    return (
        <div className="p-6 font-cairo" dir="rtl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">إضافة ترفيع جديد</h1>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-4xl">
                <PromotionForm employees={employees} />
            </div>
        </div>
    );
}
