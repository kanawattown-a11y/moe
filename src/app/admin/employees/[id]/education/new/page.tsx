
import { prisma } from '@/lib/prisma';
import NewEducationForm from './form';
import Link from 'next/link';

export default async function NewEducationPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);

    // Fetch Lookups
    const universities = await prisma.university.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const colleges = await prisma.college.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const institutes = await prisma.institute.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const certificateTypes = await prisma.certificateType.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });

    return (
        <div className="p-8 font-cairo" dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">إضافة مؤهل علمي - سجل {id}</h1>
                <Link href={`/admin/employees/${id}`} className="text-primary hover:text-primary/80">
                    &larr; عودة للبطاقة
                </Link>
            </div>

            <div className="max-w-3xl mx-auto">
                <NewEducationForm
                    employeeId={id}
                    certificateTypes={certificateTypes}
                    universities={universities}
                    colleges={colleges}
                    institutes={institutes}
                />
            </div>
        </div>
    );
}
