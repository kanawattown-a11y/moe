
'use client';

import { addEducation } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import SearchableSelect from '@/components/SearchableSelect';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-accent text-primary px-8 py-3 rounded-lg hover:bg-accent/90 transition disabled:bg-gray-300 font-bold text-lg w-full md:w-auto transform hover:scale-[1.02] active:scale-[0.98]">
            {pending ? 'جاري الحفظ...' : 'حفظ المؤهل'}
        </button>
    );
}

type Props = {
    employeeId: number;
    certificateTypes: any[];
    universities: any[];
    colleges: any[];
    institutes: any[];
};

export default function NewEducationForm({ employeeId, certificateTypes, universities, colleges, institutes }: Props) {
    return (
        <form action={addEducation.bind(null, employeeId)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-4">إضافة مؤهل علمي جديد</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الشهادة <span className="text-red-500">*</span></label>
                    <SearchableSelect
                        name="certificate_type_id"
                        required
                        options={certificateTypes.map(c => ({ value: c.id, label: c.name }))}
                        placeholder="اختر نوع الشهادة..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">عام التخرج</label>
                    <input type="text" name="graduation_year" placeholder="مثال: 2010" className="w-full border border-gray-300 rounded px-3 py-2 text-primary font-medium focus:ring-2 focus:ring-accent bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الجامعة</label>
                    <SearchableSelect
                        name="university_id"
                        options={universities.map(u => ({ value: u.id, label: u.name }))}
                        placeholder="اختر الجامعة..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكلية</label>
                    <SearchableSelect
                        name="college_id"
                        options={colleges.map(c => ({ value: c.id, label: c.name }))}
                        placeholder="اختر الكلية..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المعهد</label>
                    <SearchableSelect
                        name="institute_id"
                        options={institutes.map(i => ({ value: i.id, label: i.name }))}
                        placeholder="اختر المعهد..."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <SubmitButton />
            </div>
        </form>
    );
}
