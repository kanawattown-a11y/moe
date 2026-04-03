import Link from 'next/link';
import VisaAuditForm from './form';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function NewVisaAuditPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const employeeId = parseInt(params.id);
    if (isNaN(employeeId)) notFound();

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) notFound();

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            <div className="max-w-3xl mx-auto pt-12 pb-24 px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <Link href="/admin/employees" className="hover:text-primary transition">الموظفين</Link>
                            <span>/</span>
                            <Link href={`/admin/employees/${employeeId}`} className="hover:text-primary transition">{employee.first_name} {employee.last_name}</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-bold">إضافة تأشير رقابة</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">إضافة سجل رقابة وتأشير</h1>
                        <p className="text-gray-500 mt-2">توثيق قرارات الجهاز المركزي للرقابة المالية</p>
                    </div>
                </div>

                <VisaAuditForm employeeId={employeeId} />
            </div>
        </div>
    );
}
