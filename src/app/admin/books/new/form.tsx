'use client';

import { createBook } from '@/app/actions';
import { Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';
import { useFormStatus } from 'react-dom';
import S3FileUpload from '@/components/S3FileUpload';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition disabled:bg-green-300 shadow-lg flex items-center gap-2">
            {pending ? 'جاري الحفظ...' : 'حفظ الكتاب'}
            <Save size={18} />
        </button>
    );
}

type Props = {
    categories: any[];
}

export default function BookForm({ categories }: Props) {
    return (
        <form action={createBook} className="space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">عنوان الكتاب</label>
                    <input type="text" name="title" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">المؤلف / الجهة</label>
                    <input type="text" name="author_name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">نبذة عن الكتاب</label>
                <textarea name="description" rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all"></textarea>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">التصنيف</label>
                <SearchableSelect
                    name="category_id"
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    placeholder="اختر التصنيف..."
                />
            </div>

            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-6">
                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                    <Save size={16} />
                    <span>الملفات والمرفقات (رفع مباشر إلى S3)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <S3FileUpload 
                        name="file_url"
                        folder="books/files"
                        accept=".pdf"
                        label="ملف الكتاب (PDF)"
                        required
                    />
                    <S3FileUpload 
                        name="cover_url"
                        folder="books/covers"
                        accept="image/*"
                        label="صورة الغلاف (اختياري)"
                    />
                </div>
                <p className="text-[10px] text-blue-600 font-bold">ملاحظة: تدعم هذه الواجهة رفع الملفات الضخمة (1GB+) مباشرة إلى مخزن S3.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50">
                <SubmitButton />
            </div>
        </form>
    );
}
