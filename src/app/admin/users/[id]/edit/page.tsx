import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditUserForm from './form';

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
    });

    const employees = await prisma.employee.findMany({
        where: { status_id: 1 }, // Assuming 1 is "Active"
        select: { id: true, full_name: true, self_number: true },
        orderBy: { full_name: 'asc' }
    });

    const employeeOptions = employees.map(emp => ({
        value: emp.id,
        label: `${emp.full_name} (${emp.self_number})`
    }));

    if (!user) {
        notFound();
    }

    return (
        <div className="p-6 max-w-2xl mx-auto font-cairo" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">تعديل المستخدم: {user.username}</h1>
            </div>
            <EditUserForm user={user} employeeOptions={employeeOptions} />
        </div>
    );
}
