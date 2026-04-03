import { prisma } from '@/lib/prisma';
import EmployeeForm from '@/app/admin/employees/new/form';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    // Fetch Employee with History
    const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
            vacations: true,
            movements: true,
            promotions: true,
            education_history: true
        }
    });
    if (!employee) notFound();

    // Fetch Lookups (Reusing logic from new/page.tsx - ideally should be a cached helper)
    const schools = await prisma.school.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' }, take: 1000 });
    const jobTitles = await prisma.jobTitle.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const complexes = await prisma.educationalComplex.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const appointmentTypes = await prisma.appointmentType.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const jobCategories = await prisma.jobCategory.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const workStatuses = await prisma.workStatus.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const maritalStatuses = await prisma.maritalStatus.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const cities = await prisma.city.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const villages = await prisma.village.findMany({ select: { id: true, name: true, city_id: true }, orderBy: { name: 'asc' } });

    // New Lookups
    const universities = await prisma.university.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const colleges = await prisma.college.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const institutes = await prisma.institute.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const certificateTypes = await prisma.certificateType.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    const assignedWorks = await prisma.assignedWork.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });

    return (
        <div className="p-8 font-cairo" dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    تعديل بيانات الموظف: {employee.first_name} {employee.last_name}
                </h1>
                <Link href={`/admin/employees/${id}`} className="text-gray-600 hover:text-gray-900">
                    &larr; إلغاء وعودة
                </Link>
            </div>

            <div className="max-w-4xl mx-auto">
                <EmployeeForm
                    initialData={employee}
                    schools={schools}
                    jobTitles={jobTitles}
                    complexes={complexes}
                    appointmentTypes={appointmentTypes}
                    jobCategories={jobCategories}
                    workStatuses={workStatuses}
                    maritalStatuses={maritalStatuses}
                    cities={cities}
                    villages={villages}
                    universities={universities}
                    colleges={colleges}
                    institutes={institutes}
                    certificateTypes={certificateTypes}
                    assignedWorks={assignedWorks}
                />
            </div>
        </div>
    );
}
