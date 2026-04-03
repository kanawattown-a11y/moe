import { prisma } from '@/lib/prisma';
import VacationForm from './form';

export default async function NewVacationPage() {
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">إضافة إجازة جديدة</h1>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-4xl">
                <VacationForm employees={employees} />
            </div>
        </div>
    );
}
