import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import BookForm from './form';

export default async function NewBookPage() {
    const categories = await prisma.libraryCategory.findMany();

    return (
        <div className="p-8 font-cairo" dir="rtl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">رفع كتاب جديد</h1>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    &larr; عودة للوحة التحكم
                </Link>
            </div>

            <div className="max-w-3xl mx-auto">
                <BookForm categories={categories} />
            </div>
        </div>
    );
}
