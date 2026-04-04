'use client';

import Link from 'next/link';
import ArticleForm from './form';

export default function NewNewsPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto font-cairo" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">إضافة خبر جديد</h1>
                <Link href="/admin/news" className="text-gray-500 hover:text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow">
                    &larr; إلغاء وعودة
                </Link>
            </div>

            <ArticleForm />
        </div>
    );
}
