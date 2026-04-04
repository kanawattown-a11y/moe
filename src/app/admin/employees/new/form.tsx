'use client';

import { createEmployee } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-accent text-primary px-10 py-4 rounded-xl hover:bg-accent/90 transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 font-bold text-lg w-full md:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            {pending ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحفظ...
                </span>
            ) : 'حفظ بيانات الموظف'}
        </button>
    );
}

type Props = {
    schools: any[];
    jobTitles: any[];
    complexes: any[];
    appointmentTypes: any[];
    jobCategories: any[];
    workStatuses: any[];
    maritalStatuses: any[];
    cities: any[];
    villages: any[];
    universities: any[];
    colleges: any[];
    institutes: any[];
    certificateTypes: any[];
    assignedWorks: any[];
    initialData?: any & {
        leave_requests?: any[];
        transfers?: any[];
        promotions?: any[];
    }; // For edit mode
};

export default function EmployeeForm({
    schools, jobTitles, complexes, appointmentTypes,
    jobCategories, workStatuses, maritalStatuses, cities, villages,
    universities, colleges, institutes, certificateTypes, assignedWorks,
    initialData
}: Props) {
    const [selectedCity, setSelectedCity] = useState<string>(initialData?.city_id?.toString() || "");
    const [activeTab, setActiveTab] = useState('personal');

    const filteredVillages = selectedCity
        ? villages.filter(v => v.city_id === Number(selectedCity))
        : villages;

    const tabs = [
        { id: 'personal', label: 'البيانات الشخصية', icon: '👤' },
        { id: 'job', label: 'البيانات الوظيفية', icon: '💼' },
        { id: 'financial', label: 'البيانات المالية', icon: '💰' },
        { id: 'education', label: 'المؤهلات العلمية', icon: '🎓' },
        { id: 'history', label: 'المسار الوظيفي والإجازات', icon: '📅' },
    ];

    const inputClasses = "w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 bg-white outline-none placeholder-gray-500 text-gray-900 font-bold";
    const labelClasses = "block text-sm font-black text-gray-900 mb-2";
    const sectionTitleClasses = "text-xl font-black text-primary mb-6 flex items-center gap-2 border-b border-gray-200 pb-4";

    return (
        <form action={createEmployee} className="space-y-8">

            {/* Tabs Header */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-6 py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-md transform scale-[1.02]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[500px]">

                {/* 1. Personal Info Tab */}
                <div className={activeTab === 'personal' ? 'block animate-fadeIn' : 'hidden'}>
                    <h3 className={sectionTitleClasses}>
                        <span className="bg-accent/20 p-2 rounded-lg text-2xl">👤</span>
                        البيانات الشخصية والعنوان
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <label className={labelClasses}>الاسم الأول <span className="text-red-500">*</span></label>
                            <input type="text" name="first_name" defaultValue={initialData?.first_name} required className={inputClasses} placeholder="الاسم الأول" />
                        </div>
                        <div>
                            <label className={labelClasses}>اسم الأب</label>
                            <input type="text" name="father_name" defaultValue={initialData?.father_name} className={inputClasses} placeholder="اسم الأب" />
                        </div>
                        <div>
                            <label className={labelClasses}>النسبة (الكنية) <span className="text-red-500">*</span></label>
                            <input type="text" name="last_name" defaultValue={initialData?.last_name} required className={inputClasses} placeholder="الكنية" />
                        </div>
                        <div>
                            <label className={labelClasses}>اسم الأم</label>
                            <input type="text" name="mother_full_name" defaultValue={initialData?.mother_full_name} className={inputClasses} placeholder="اسم الأم" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <label className={labelClasses}>الجنس</label>
                            <div className="relative">
                                <select name="gender" defaultValue={initialData?.gender} className={`${inputClasses} appearance-none`}>
                                    <option value="">اختر الجنس...</option>
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                </select>
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>تاريخ الولادة</label>
                            <input type="date" name="birth_date" defaultValue={initialData?.birth_date ? new Date(initialData.birth_date).toISOString().split('T')[0] : ''} className={inputClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>مكان الولادة</label>
                            <input type="text" name="birth_place" defaultValue={initialData?.birth_place} className={inputClasses} placeholder="المحافظة / المدينة" />
                        </div>
                        <div>
                            <label className={labelClasses}>الرقم الوطني</label>
                            <input type="text" name="national_id" defaultValue={initialData?.national_id} className={inputClasses} placeholder="11 خانة" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <label className={labelClasses}>الوضع العائلي</label>
                            <SearchableSelect
                                name="marital_status_id"
                                defaultValue={initialData?.marital_status_id}
                                options={maritalStatuses.map(s => ({ value: s.id, label: s.name }))}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>عدد الأولاد</label>
                            <input type="number" name="children_count" defaultValue={initialData?.children_count} min="0" className={inputClasses} placeholder="0" />
                        </div>
                        <div>
                            <label className={labelClasses}>رقم الهاتف/الجوال</label>
                            <input type="text" name="mobile" defaultValue={initialData?.mobile} className={inputClasses} placeholder="09xxxxxxxx" />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📍</span> العنوان
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClasses}>المدينة / المنطقة</label>
                                <SearchableSelect
                                    name="city_id"
                                    defaultValue={selectedCity || undefined}
                                    options={cities.map(c => ({ value: c.id, label: c.name }))}
                                    onChange={(option: any) => setSelectedCity(option?.value ? String(option.value) : "")}
                                    placeholder="اختر المدينة..."
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>القرية / الحي</label>
                                <SearchableSelect
                                    name="village_id"
                                    defaultValue={initialData?.village_id}
                                    options={filteredVillages.map(v => ({ value: v.id, label: v.name }))}
                                    placeholder="اختر..."
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>تفاصيل العنوان</label>
                                <input type="text" name="address_details" defaultValue={initialData?.suwayda_full_address} placeholder="الشارع، البناء..." className={inputClasses} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Job Info Tab */}
                <div className={activeTab === 'job' ? 'block animate-fadeIn' : 'hidden'}>
                    <h3 className={sectionTitleClasses}>
                        <span className="bg-accent/20 p-2 rounded-lg text-2xl">💼</span>
                        البيانات الوظيفية
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className={labelClasses}>الرقم الذاتي <span className="text-red-500">*</span></label>
                            <input type="text" name="self_number" defaultValue={initialData?.self_number} required className={inputClasses} placeholder="الرقم الذاتي" />
                        </div>
                        <div>
                            <label className={labelClasses}>الرمز الوظيفي</label>
                            <input type="text" name="job_code" defaultValue={initialData?.job_code} className={inputClasses} placeholder="اختياري" />
                        </div>
                        <div>
                            <label className={labelClasses}>حالة الدوام</label>
                            <SearchableSelect
                                name="status_id"
                                defaultValue={initialData?.status_id}
                                options={workStatuses.map(s => ({ value: s.id, label: s.name }))}
                                placeholder="اختر الحالة..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelClasses}>مكان العمل الحالي (المدرسة)</label>
                            <SearchableSelect
                                name="school_id"
                                defaultValue={initialData?.school_id}
                                options={schools.map(s => ({ value: s.id, label: s.name }))}
                                placeholder="اختر المدرسة..."
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>المجمع التربوي</label>
                            <SearchableSelect
                                name="complex_id"
                                defaultValue={initialData?.complex_id}
                                options={complexes.map(c => ({ value: c.id, label: c.name }))}
                                placeholder="اختر المجمع..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className={labelClasses}>المسمى الوظيفي الحالي</label>
                            <SearchableSelect
                                name="job_title_id"
                                defaultValue={initialData?.job_title_current_id}
                                options={jobTitles.map(j => ({ value: j.id, label: j.name }))}
                                placeholder="اختر المسمى..."
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>المسمى الوظيفي عند التعيين</label>
                            <SearchableSelect
                                name="job_title_at_appt_id"
                                defaultValue={initialData?.job_title_at_appt_id}
                                options={jobTitles.map(j => ({ value: j.id, label: j.name }))}
                                placeholder="اختر المسمى..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className={labelClasses}>العمل المكلف به</label>
                            <SearchableSelect
                                name="assigned_work_id"
                                defaultValue={initialData?.assigned_work_id}
                                options={assignedWorks.map(w => ({ value: w.id, label: w.name }))}
                                placeholder="اختر العمل..."
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>ملاحظات عامة</label>
                            <textarea name="notes" defaultValue={initialData?.notes} className={inputClasses} placeholder="ملاحظات إضافية..." rows={1} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📋</span> تفاصيل التعيين
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClasses}>نوع التعيين</label>
                                <SearchableSelect
                                    name="appointment_type_id"
                                    defaultValue={initialData?.appointment_type_id}
                                    options={appointmentTypes.map(t => ({ value: t.id, label: t.name }))}
                                    placeholder="اختر..."
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>تاريخ المباشرة</label>
                                <input type="date" name="appointment_date" defaultValue={initialData?.appointment_date ? new Date(initialData.appointment_date).toISOString().split('T')[0] : ''} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>الفئة الوظيفية</label>
                                <SearchableSelect
                                    name="job_category_id"
                                    defaultValue={initialData?.job_category_id}
                                    options={jobCategories.map(c => ({ value: c.id, label: c.name }))}
                                    placeholder="اختر..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Financial Info Tab */}
                <div className={activeTab === 'financial' ? 'block animate-fadeIn' : 'hidden'}>
                    <h3 className={sectionTitleClasses}>
                        <span className="bg-accent/20 p-2 rounded-lg text-2xl">💰</span>
                        البيانات المالية والتعويضات
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                            <label className={labelClasses}>الراتب المقطوع (الأساسي) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    name="base_salary" 
                                    step="any"
                                    defaultValue={initialData?.base_salary || 0} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="0" 
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">ل.س</span>
                            </div>
                            <p className="text-[10px] text-blue-600 mt-2 font-bold italic">* الراتب الأساسي المسجل في قرار التعيين أو آخر ترفيع.</p>
                        </div>
                        
                        <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                            <label className={labelClasses}>التعويض العائلي</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    name="family_allowance" 
                                    step="any"
                                    defaultValue={initialData?.family_allowance || 0} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="0" 
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">ل.س</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100">
                            <label className={labelClasses}>تعويض طبيعة العمل / تعويضات أخرى</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    name="nature_of_work_allowance" 
                                    step="any"
                                    defaultValue={initialData?.nature_of_work_allowance || 0} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="0" 
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">ل.س</span>
                            </div>
                        </div>

                        <div className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100">
                            <label className={labelClasses}>اقتطاعات ثابتة أخرى</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    name="other_deductions" 
                                    step="any"
                                    defaultValue={initialData?.other_deductions || 0} 
                                    className={`${inputClasses} pl-12`} 
                                    placeholder="0" 
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase">ل.س</span>
                            </div>
                            <p className="text-[10px] text-rose-600 mt-2 font-bold italic">* أي اقتطاعات أخرى غير التأمينات والضرائب الآلية.</p>
                        </div>
                    </div>
                </div>

                {/* 3. Education Info Tab */}
                <div className={activeTab === 'education' ? 'block animate-fadeIn' : 'hidden'}>
                    <h3 className={sectionTitleClasses}>
                        <span className="bg-accent/20 p-2 rounded-lg text-2xl">🎓</span>
                        المؤهلات العلمية
                    </h3>

                    <div className="bg-blue-50/50 p-8 rounded-xl border border-blue-100/50">
                        <h4 className="font-bold text-primary mb-6 flex items-center gap-2">
                            <span className="bg-white p-1 rounded-md shadow-sm">📜</span>
                            الشهادة الأساسية
                            <span className="text-xs font-normal text-gray-500 mr-2">(أعلى مؤهل علمي)</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClasses}>نوع الشهادة</label>
                                <SearchableSelect
                                    name="certificate_type_id"
                                    options={certificateTypes.map(c => ({ value: c.id, label: c.name }))}
                                    placeholder="اختر نوع الشهادة..."
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>عام التخرج</label>
                                <input type="text" name="graduation_year" placeholder="مثال: 2010" className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>الجامعة</label>
                                <SearchableSelect
                                    name="university_id"
                                    options={universities.map(u => ({ value: u.id, label: u.name }))}
                                    placeholder="اختر الجامعة..."
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>الكلية</label>
                                <SearchableSelect
                                    name="college_id"
                                    options={colleges.map(c => ({ value: c.id, label: c.name }))}
                                    placeholder="اختر الكلية..."
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className={labelClasses}>المعهد (إن وجد)</label>
                                <SearchableSelect
                                    name="institute_id"
                                    options={institutes.map(i => ({ value: i.id, label: i.name }))}
                                    placeholder="اختر المعهد..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. History Tab */}
                <div className={activeTab === 'history' ? 'block animate-fadeIn' : 'hidden'}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={sectionTitleClasses}>
                            <span className="bg-accent/20 p-2 rounded-lg text-2xl">📅</span>
                            المسار الوظيفي والإجازات
                        </h3>
                        {!initialData && (
                            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                                يتم تفعيل هذا السجل تلقائياً بعد إضافة الموظف وحفظ بياناته الأساسية.
                            </span>
                        )}
                    </div>

                    {initialData ? (
                        <div className="space-y-12">
                            {/* Vacations */}
                            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span>🏖️</span> سجل الإجازات
                                    </h4>
                                    <Link href={`/admin/vacations/new?employee_id=${initialData.id}`} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition">
                                        + إضافة إجازة
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">النوع</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">المدة</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">من تاريخ</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">إلى تاريخ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {initialData.leave_requests?.length > 0 ? (
                                                initialData.leave_requests.map((v: any) => (
                                                    <tr key={v.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{v.leave_type}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.duration} يوم</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.start_date ? new Date(v.start_date).toLocaleDateString('ar-SY') : '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.end_date ? new Date(v.end_date).toLocaleDateString('ar-SY') : '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">لا يوجد سجل إجازات.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Movements */}
                            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span>✈️</span> حركات التنقلات
                                    </h4>
                                    <Link href={`/admin/movements/new?employee_id=${initialData.id}`} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition">
                                        + إضافة حركة
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">نوع الحركة</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">الجهة</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">رقم القرار</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">تاريخ المباشرة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {initialData.transfers?.length > 0 ? (
                                                initialData.transfers.map((m: any) => (
                                                    <tr key={m.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{m.action_type}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.entity}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.decision_num}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.start_date ? new Date(m.start_date).toLocaleDateString('ar-SY') : '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">لا يوجد سجل تنقلات.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Promotions */}
                            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span>📈</span> سجل الترفيعات
                                    </h4>
                                    <Link href={`/admin/promotions/new?employee_id=${initialData.id}`} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition">
                                        + إضافة ترفيع
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">الأجر قبل</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">الأجر بعد</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {initialData.promotions?.length > 0 ? (
                                                initialData.promotions.map((p: any) => (
                                                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.current_date ? new Date(p.current_date).toLocaleDateString('ar-SY') : '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{p.salary_before?.toLocaleString()}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 font-mono">{p.salary_after?.toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">لا يوجد سجل ترفيعات.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="bg-white p-4 rounded-full shadow-md mb-4">
                                <span className="text-4xl">📝</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-700 mb-2">سجل الموظف فارغ</h4>
                            <p className="text-gray-500 max-w-sm text-center font-medium">يرجى حفظ بيانات الموظف الأساسية أولاً لتتمكن من إضافة سجلات المسار الوظيفي والإجازات لاحقاً.</p>
                        </div>
                    )}
                </div>

            </div>

            <div className="flex justify-end pt-4">
                <SubmitButton />
            </div>
        </form>
    );
}
