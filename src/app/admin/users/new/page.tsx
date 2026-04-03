import { prisma } from '@/lib/prisma';
import NewUserForm from './form';
import Link from 'next/link';

export default async function NewUserPage() {
    const employees = await prisma.employee.findMany({
        where: { status_id: 1 }, // Active
        select: { id: true, full_name: true, self_number: true },
        orderBy: { full_name: 'asc' }
    });

    const employeeOptions = employees.map(emp => ({
        value: emp.id,
        label: `${emp.full_name} (${emp.self_number})`
    }));

    return (
        <div className="p-6 max-w-2xl mx-auto font-cairo" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">إضافة مستخدم جديد</h1>
                <Link href="/admin/users" className="text-gray-500 hover:text-gray-700">
                    &larr; عودة للقائمة
                </Link>
            </div>

            <NewUserForm employeeOptions={employeeOptions} />
        </div>
    );
}
