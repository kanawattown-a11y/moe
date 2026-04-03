import { prisma } from '@/lib/prisma';
import EmployeeForm from '@/app/admin/employees/new/form';
import Link from 'next/link';
import Image from 'next/image';

export default async function NewEmployeePage() {
    // Fetch lookups from DB
    const schools = await prisma.school.findMany({ orderBy: { name: 'asc' } });
    const jobTitles = await prisma.jobTitle.findMany({ orderBy: { name: 'asc' } });
    const complexes = await prisma.educationalComplex.findMany({ orderBy: { name: 'asc' } });
    const appointmentTypes = await prisma.appointmentType.findMany({ orderBy: { name: 'asc' } });
    const jobCategories = await prisma.jobCategory.findMany({ orderBy: { name: 'asc' } });
    const workStatuses = await prisma.workStatus.findMany({ orderBy: { name: 'asc' } });
    const maritalStatuses = await prisma.maritalStatus.findMany({ orderBy: { name: 'asc' } });
    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    const villages = await prisma.village.findMany({ orderBy: { name: 'asc' } });
    const universities = await prisma.university.findMany({ orderBy: { name: 'asc' } });
    const colleges = await prisma.college.findMany({ orderBy: { name: 'asc' } });
    const institutes = await prisma.institute.findMany({ orderBy: { name: 'asc' } });
    const certificateTypes = await prisma.certificateType.findMany({ orderBy: { name: 'asc' } });
    const assignedWorks = await prisma.assignedWork.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            {/* Header */}
            <div className="bg-primary text-white pt-10 pb-20 px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/logo.jpg" alt="bg" fill className="object-cover" />
                </div>
                <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
                            <Link href="/admin/employees" className="hover:text-white transition">الموظفين</Link>
                            <span>/</span>
                            <span>إضافة جديد</span>
                        </div>
                        <h1 className="text-3xl font-bold">إضافة موظف جديد</h1>
                    </div>
                    <Link href="/admin/employees" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                        <span>&larr; إلغاء وعودة</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 pb-12">
                <EmployeeForm
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
