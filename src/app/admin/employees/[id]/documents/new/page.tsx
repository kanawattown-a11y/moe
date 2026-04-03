'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { addDocument } from '../actions';
import { FileText, ArrowRight, Save, Link as LinkIcon, FileCheck } from 'lucide-react';
import Link from 'next/link';
import S3FileUpload from '@/components/S3FileUpload';

export default function NewDocumentPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const id = parseInt(params.id);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        try {
            await addDocument(id, formData);
        } catch (error: any) {
            alert(error.message);
        }
    }

    const documentTypes = [
        { value: 'قرار', label: 'قرار وزاري / إداري' },
        { value: 'هوية', label: 'بطاقة شخصية / جواز سفر' },
        { value: 'شهادة', label: 'وثيقة تخرج / مؤهل' },
        { value: 'صورة', label: 'صورة شخصية' },
        { value: 'أخرى', label: 'وثائق أخرى' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-cairo" dir="rtl">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">إضافة وثيقة جديدة للرقم {id}</h1>
                            <p className="text-gray-500 text-sm">أرشفة القرارات والمرفقات في ملف الموظف</p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/employees/${id}`}
                        className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-xl border border-gray-100 shadow-sm"
                    >
                        <ArrowRight size={24} />
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <form action={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <FileCheck size={16} className="text-primary" />
                                    <span>عنوان الوثيقة</span>
                                </label>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    placeholder="مثلاً: قرار التعيين رقم 123"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">نوع الوثيقة</label>
                                <select
                                    name="file_type"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white"
                                >
                                    <option value="">اختر النوع...</option>
                                    {documentTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* S3 File Upload */}
                        <S3FileUpload 
                            name="file_url"
                            folder={`employees/${id}/documents`}
                            label="رفع الملف (PDF, صور, أو مستندات)"
                            required
                        />

                        {/* Form Actions */}
                        <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href={`/admin/employees/${id}`}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </Link>
                            <button
                                type="submit"
                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Save size={20} />
                                <span>حفظ وأرشفة الوثيقة</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
