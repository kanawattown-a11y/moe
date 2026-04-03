import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SchoolDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    const school = await prisma.school.findUnique({
        where: { id },
        include: {
            city: true,
            village: true,
            complex: true,
            employees: {
                include: {
                    job_title_current: true
                },
                orderBy: {
                    first_name: 'asc'
                }
            }
        }
    });

    if (!school) notFound();

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {school.city?.name} - {school.village?.name} | {school.complex?.name}
                        </p>
                    </div>
                    <Link href="/schools" className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition">
                        &larr; كل المدارس
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">بيانات المدرسة</h3>
                            </div>
                            <div className="px-4 py-5 sm:p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">الرقم الإحصائي</label>
                                    <p className="mt-1 text-sm text-gray-900 font-semibold">{school.stat_num || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">المرحلة الدراسية</label>
                                    <p className="mt-1 text-sm text-gray-900">{school.stage} ({school.stage_type})</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">نوع التعليم</label>
                                    <p className="mt-1 text-sm text-gray-900">{school.education_type || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">الهاتف</label>
                                    <p className="mt-1 text-sm text-gray-900" dir="ltr">{school.phone || '-'}</p>
                                </div>
                                {school.manager_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">معرف المدير</label>
                                        {/* Could fetch manager name if relation existed on manager_id directly to employee */}
                                        <p className="mt-1 text-sm text-gray-900">{school.manager_id}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Employee Grid */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>الكادر الإداري والتدريسي</span>
                            <span className="bg-gray-100 text-primary text-sm font-normal py-1 px-3 rounded-full">
                                {school.employees.length}
                            </span>
                        </h2>

                        <div className="bg-white shadow overflow-hidden rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {school.employees.length > 0 ? (
                                    school.employees.map((emp) => (
                                        <li key={emp.id} className="hover:bg-gray-50 transition">
                                            <Link href={`/admin/employees/${emp.id}`} className="block px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-md font-bold text-primary truncate">
                                                        {emp.first_name} {emp.father_name} {emp.last_name}
                                                    </p>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {emp.job_title_current?.name || 'موظف'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex">
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            الرقم الذاتي: {emp.self_number || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <p>عرض التفاصيل &larr;</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-8 text-center text-gray-500">
                                        لا يوجد بيانات للكادر في هذه المدرسة حالياً.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
