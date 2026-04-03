import { prisma } from '@/lib/prisma';
import NewPositionStaffingForm from './form';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function NewPositionStaffingPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    const employee = await prisma.employee.findUnique({
        where: { id },
        select: { first_name: true, last_name: true }
    });

    if (!employee) notFound();

    return (
        <div className="p-8 font-cairo bg-gray-50 min-h-screen" dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إضافة قرار ملاك جديد</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        للموظف: {employee.first_name} {employee.last_name} (سجل {id})
                    </p>
                </div>
                <Link href={`/admin/employees/${id}`} className="text-primary hover:text-primary/80 font-bold bg-white px-4 py-2 rounded-lg border border-gray-200">
                    &larr; عودة لملف الموظف
                </Link>
            </div>

            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <NewPositionStaffingForm employeeId={id} />
            </div>
        </div>
    );
}
