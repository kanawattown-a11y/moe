import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function EmployeeDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
            school: true,
            job_title_current: true,
            job_title_at_appt: true,
            appointment_type: true,
            job_category: true,
            work_status: true,
            marital_status: true,
            city: true,
            village: true,
            complex: true,
            educations: {
                include: {
                    certificate_type: true
                }
            },
            leave_requests: true,
            transfers: true,
            promotions: true,
            terminations: true,
            position_staffings: true,
            category_modifications: {
                include: {
                    new_category: true,
                    new_job_title: true,
                }
            },
            weekly_quotas: {
                include: {
                    educational_complex: true,
                    school: true
                }
            },
            visa_audits: true,
            documents: {
                orderBy: { uploaded_at: 'desc' }
            },
            salary_records: {
                orderBy: [
                    { year: 'desc' },
                    { month: 'desc' }
                ]
            }
        },
    });

    if (!employee) notFound();

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
                            <span>{employee.first_name} {employee.last_name}</span>
                        </div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <span>{employee.first_name} {employee.father_name} {employee.last_name}</span>
                            <span className="bg-accent text-primary text-sm px-3 py-1 rounded-full font-bold shadow-sm">
                                {employee.job_title_current?.name || 'موظف'}
                            </span>
                        </h1>
                    </div>
                    <div className="space-x-4 space-x-reverse flex">
                        <Link href="/admin/employees" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                            <span>&larr; القائمة</span>
                        </Link>
                        <Link href={`/admin/employees/${employee.id}/edit`} className="bg-accent text-primary font-bold px-6 py-2.5 rounded-lg hover:bg-accent/90 transition shadow-lg hover:shadow-xl flex items-center gap-2">
                            <span>✏️ تعديل البيانات</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 space-y-8 pb-12">

                {/* Main Info Card */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-3">
                        <span className="bg-blue-50 text-primary p-2 rounded-lg text-xl">👤</span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">البيانات الشخصية والوظيفية</h3>
                            <p className="text-sm text-gray-500">تفاصيل السجل رقم {employee.id}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100">
                        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">

                            <InfoItem label="الاسم الكامل" value={`${employee.first_name} ${employee.father_name} ${employee.last_name}`} />
                            <InfoItem label="الرقم الذاتي" value={employee.self_number} />
                            <InfoItem label="الرقم الوطني" value={employee.national_id} />

                            <InfoItem label="المدرسة / المركز" value={employee.school?.name} highlight />
                            <InfoItem label="المسمى الوظيفي" value={employee.job_title_current?.name} />
                            <InfoItem label="المجمع التربوي" value={employee.complex?.name} />

                            <InfoItem label="الحالة" value={employee.work_status?.name} />
                            <InfoItem label="العنوان" value={`${employee.city?.name || ''} - ${employee.village?.name || ''} - ${employee.suwayda_full_address || ''}`} fullWidth />
                        </dl>
                    </div>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border-t-4 border-amber-400">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-amber-50/30">
                        <div className="flex items-center gap-3">
                            <span className="bg-amber-100 text-amber-700 p-2 rounded-lg text-xl">💰</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">الخلاصة المالية (الراتب الحالي)</h3>
                                <p className="text-xs text-gray-500 font-bold italic">* البيانات المحسوبة حالياً بناءً على آخر تحديث للملف.</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-100">
                        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
                            <InfoItem label="الراتب المقطوع" value={`${employee.base_salary?.toLocaleString() || 0} ل.س`} highlight />
                            <InfoItem label="التعويض العائلي" value={`${employee.family_allowance?.toLocaleString() || 0} ل.س`} />
                            <InfoItem label="تعويضات أخرى" value={`${employee.nature_of_work_allowance?.toLocaleString() || 0} ل.س`} />
                            <div className="px-6 py-5 border-b border-gray-100 bg-primary/5">
                                <dt className="text-xs font-bold text-primary uppercase tracking-wide mb-1 opacity-80">صافي الاستحقاق (تقديري)</dt>
                                <dd className="text-lg text-primary font-black">
                                    {((employee.base_salary || 0) + (employee.family_allowance || 0) + (employee.nature_of_work_allowance || 0) - (employee.other_deductions || 0)).toLocaleString()} ل.س
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Education History Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-green-50 text-green-700 p-2 rounded-lg text-xl">🎓</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">المؤهلات العلمية</h3>
                                <p className="text-sm text-gray-500">سجل الشهادات والدرجات العلمية</p>
                            </div>
                        </div>
                        <Link href={`/admin/employees/${employee.id}/education/new`} className="text-sm text-primary hover:text-accent font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition">
                            + إضافة مؤهل
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">نوع الشهادة</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الجامعة / الجهة</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الكلية / المعهد</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">عام التخرج</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {/* @ts-ignore - types are being generated */}
                                {employee.educations && employee.educations.length > 0 ? (
                                    employee.educations.map((edu: any) => (
                                        <tr key={edu.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {edu.certificate_type?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {edu.university_id ? `جامعة ${edu.university_id}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {edu.college_id ? `كلية ${edu.college_id}` : (edu.institute_id ? `معهد ${edu.institute_id}` : '-')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                                {edu.grad_year || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد مؤهلات مسجلة حتى الآن.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Promotions Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-purple-50 text-purple-700 p-2 rounded-lg text-xl">📈</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">سجل الترفيعات</h3>
                                <p className="text-sm text-gray-500">تطور الأجر والدرجات الوظيفية</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ الترفيع</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الأجر قبل</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الأجر بعد</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">نسبة العلاوة</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.promotions && employee.promotions.length > 0 ? (
                                    employee.promotions.map((prom: any) => (
                                        <tr key={prom.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {prom.current_date ? new Date(prom.current_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {prom.salary_before}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                {prom.salary_after}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {prom.raise_percentage}%
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد ترفيعات مسجلة.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vacations Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-orange-50 text-orange-700 p-2 rounded-lg text-xl">🏖️</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">سجل الإجازات</h3>
                                <p className="text-sm text-gray-500">الإجازات الإدارية والصحية وغيرها</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">نوع الإجازة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ القرارة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المدة (أيام)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">من تاريخ</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">إلى تاريخ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.leave_requests && employee.leave_requests.length > 0 ? (
                                    employee.leave_requests.map((vac: any) => (
                                        <tr key={vac.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {vac.leave_type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {vac.decision_num}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                {vac.duration}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vac.start_date ? new Date(vac.start_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vac.end_date ? new Date(vac.end_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد إجازات مسجلة.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Movements Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-teal-50 text-teal-700 p-2 rounded-lg text-xl">✈️</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">حركات التنقلات</h3>
                                <p className="text-sm text-gray-500">الندب، الإعارة، والنقل</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">نوع الحركة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الجهة المستفيدة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم القرار</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ الانفكاك</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ المباشرة</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.transfers && employee.transfers.length > 0 ? (
                                    employee.transfers.map((move: any) => (
                                        <tr key={move.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {move.action_type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {move.entity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {move.decision_num}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {move.start_date ? new Date(move.start_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {move.return_date ? new Date(move.return_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد حركات تنقل مسجلة.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Position Staffing Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-50 text-blue-700 p-2 rounded-lg text-xl">🏢</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">سجل الملاك</h3>
                                <p className="text-sm text-gray-500">قرارات التعيين والملاك</p>
                            </div>
                        </div>
                        <Link href={`/admin/employees/${employee.id}/position-staffing/new`} className="text-sm text-primary hover:text-accent font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition">
                            + إضافة قرار ملاك
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">نمط التعيين</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم القرار</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ القرار</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.position_staffings && employee.position_staffings.length > 0 ? (
                                    employee.position_staffings.map((staffing: any) => (
                                        <tr key={staffing.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {staffing.appointment_type || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {staffing.decision_number || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staffing.decision_date ? new Date(staffing.decision_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staffing.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد قرارات ملاك مسجلة.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category Modifications Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-50 text-indigo-700 p-2 rounded-lg text-xl">🔄</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">سجل تعديل الفئة</h3>
                                <p className="text-sm text-gray-500">تعديلات الفئة والمسمى الوظيفي</p>
                            </div>
                        </div>
                        <Link href={`/admin/employees/${employee.id}/category-modification/new`} className="text-sm text-primary hover:text-accent font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition">
                            + إضافة تعديل فئة
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الفئة الحالية</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الفئة الجديدة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المسمى الوظيفي الجديد</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم القرار</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ القرار</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.category_modifications && employee.category_modifications.length > 0 ? (
                                    employee.category_modifications.map((mod: any) => (
                                        <tr key={mod.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 line-through">
                                                {mod.current_job_category || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                                                {mod.new_category?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {mod.new_job_title?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {mod.decision_number || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {mod.decision_date ? new Date(mod.decision_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد قرارات تعديل فئة مسجلة.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Visa Audits Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-rose-50 text-rose-700 p-2 rounded-lg text-xl">🛡️</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">سجل الرقابة والتأشير</h3>
                                <p className="text-sm text-gray-500">الجهاز المركزي للرقابة المالية</p>
                            </div>
                        </div>
                        <Link href={`/admin/employees/${employee.id}/visa-audit/new`} className="text-sm text-primary hover:text-accent font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition">
                            + إضافة تأشير
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">نوع وقرار الترفيع</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ قرار الترفيع</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم قرار التأشير</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">تاريخ التأشير</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.visa_audits && employee.visa_audits.length > 0 ? (
                                    employee.visa_audits.map((audit: any) => (
                                        <tr key={audit.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {audit.promotion_decision_name} ({audit.promotion_decision_num})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {audit.promotion_decision_date ? new Date(audit.promotion_decision_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-rose-600">
                                                {audit.visa_decision_num || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {audit.visa_decision_date ? new Date(audit.visa_decision_date).toLocaleDateString('ar-SY') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {audit.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد سجلات تأشير.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Weekly Quota Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-emerald-50 text-emerald-700 p-2 rounded-lg text-xl">⏳</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">النصاب الأسبوعي</h3>
                                <p className="text-sm text-gray-500">ساعات العمل الأسبوعية والتكليفات</p>
                            </div>
                        </div>
                        <Link href={`/admin/employees/${employee.id}/weekly-quota/new`} className="text-sm text-primary hover:text-accent font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition">
                            + إضافة نصاب
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المجمع التربوي</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المدرسة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">عدد الساعات</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">إضافي</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {employee.weekly_quotas && employee.weekly_quotas.length > 0 ? (
                                    employee.weekly_quotas.map((quota: any) => (
                                        <tr key={quota.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {quota.educational_complex?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {quota.school?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                                                {quota.hours || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                {quota.is_extra ? <span className="text-emerald-500">نعم</span> : <span className="text-gray-400">لا</span>}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا يوجد نصاب أسبوعي مسجل.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Documents / Archive Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-gray-50 text-gray-700 p-2 rounded-lg text-xl">📁</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">الأرشيف الإلكتروني (المرفقات)</h3>
                                <p className="text-sm text-gray-500">القرارات والوثائق الممسوحة ضوئياً</p>
                            </div>
                        </div>
                        <Link href={`/admin/employees/${employee.id}/documents/new`} className="text-sm text-primary hover:text-accent font-bold bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition">
                            + إضافة وثيقة
                        </Link>
                    </div>
                    <div className="p-6">
                        {/* @ts-ignore - types are being generated */}
                        {employee.documents && employee.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* @ts-ignore */}
                                {employee.documents.map((doc: any) => (
                                    <div key={doc.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-black text-primary uppercase text-[10px]">
                                            {doc.file_type || 'DOC'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{doc.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{new Date(doc.uploaded_at).toLocaleDateString('ar-SY')}</p>
                                        </div>
                                        <a href={doc.file_url} target="_blank" className="p-2 text-primary hover:bg-blue-50 rounded-lg transition">
                                            📥
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 italic text-sm">
                                لا توجد وثائق مؤرشفة لهذا الموظف.
                            </div>
                        )}
                    </div>
                </div>

                {/* Salary History Section */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden overflow-x-auto">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-amber-50 text-amber-700 p-2 rounded-lg text-xl">💰</span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">سجل الرواتب والمستحقات</h3>
                                <p className="text-sm text-gray-500">الأرشيف المالي والدفعات الشهرية</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الشهر / السنة</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الراتب الأساسي</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">التعويضات</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الاقتطاعات</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الصافي</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {/* @ts-ignore */}
                                {employee.salary_records && employee.salary_records.length > 0 ? (
                                    employee.salary_records.map((record: any) => (
                                        <tr key={record.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {record.month} / {record.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {record.base_salary.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600">
                                                +{record.allowances.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                -{record.deductions.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary">
                                                {record.total.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${record.is_paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {record.is_paid ? 'تم الصرف' : 'قيد الانتظار'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                            لا توجد سجلات مالية مؤرشفة لهذا الموظف.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notes */}
                {employee.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="text-yellow-800 font-bold mb-2">ملاحظات</h4>
                        <p className="text-yellow-900">{employee.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoItem({ label, value, fullWidth = false, highlight = false }: { label: string, value: any, fullWidth?: boolean, highlight?: boolean }) {
    return (
        <div className={`px-6 py-5 border-b border-gray-100 ${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''} ${highlight ? 'bg-blue-50/30' : ''}`}>
            <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 opacity-80">{label}</dt>
            <dd className={`text-sm text-gray-900 font-medium ${!value ? 'text-gray-400 italic' : ''}`}>
                {value !== undefined && value !== null ? String(value) : 'غير محدد'}
            </dd>
        </div>
    );
}
