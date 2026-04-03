'use client';

import { createArticle } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import S3FileUpload from '@/components/S3FileUpload';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300">
            {pending ? 'جاري النشر...' : 'نشر الخبر'}
        </button>
    );
}

export default function ArticleForm() {
    return (
        <form action={createArticle} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الخبر</label>
                <input type="text" name="title" required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مقتطف قصير (يظهر في القائمة)</label>
                <textarea name="excerpt" rows={3} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نص الخبر الكامل</label>
                <textarea name="content" required rows={10} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <S3FileUpload 
                name="image_url"
                folder="news"
                accept="image/*"
                label="صورة الخبر (اختياري)"
            />

            <div className="flex justify-end pt-4">
                <SubmitButton />
            </div>
        </form>
    );
}
