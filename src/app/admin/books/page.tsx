import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import DeleteBookButton from './delete-button';

import SearchBar from '../employees/SearchBar';

export default async function AdminBooksPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams.q || '';

    const books = await prisma.book.findMany({
        where: query ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { author_name: { contains: query, mode: 'insensitive' } }
            ]
        } : {},
        include: {
            category: true,
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة المكتبة</h1>
                    <p className="text-gray-500 mt-2">إدارة الكتب والمراجع في المكتبة الرقمية</p>
                </div>
                <Link href="/admin/books/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <Plus size={20} />
                    <span>إضافة كتاب جديد</span>
                </Link>
            </div>

            {/* Fast Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <SearchBar placeholder="ابحث عن كتاب أو مؤلف..." />
                <div className="text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 whitespace-nowrap">
                    {query ? `نتائج البحث: ${books.length}` : `إجمالي الكتب: ${books.length}`}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                        <tr>
                            <th className="p-5">اسم الكتاب</th>
                            <th className="p-5">المؤلف</th>
                            <th className="p-5">التصنيف</th>
                            <th className="p-5">الرابط</th>
                            <th className="p-5">الحالة</th>
                            <th className="p-5">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {books.map(b => (
                            <tr key={String(b.id)} className="hover:bg-blue-50/40 transition-colors group">
                                <td className="p-5 font-bold text-gray-900 group-hover:text-primary transition-colors">
                                    {b.title}
                                </td>
                                <td className="p-5 text-gray-700">{b.author_name || '-'}</td>
                                <td className="p-5">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-50 text-gray-700 border-gray-200">
                                        {b.category?.name || '-'}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <a href={b.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 font-bold hover:underline max-w-[200px] truncate block" dir="ltr">
                                        عرض/تحميل
                                    </a>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${b.is_public ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {b.is_public ? 'عام' : 'خاص'}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex gap-2">
                                        <DeleteBookButton id={String(b.id) as any} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {books.length === 0 && (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <BookOpen size={32} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 mb-1">لا توجد كتب مسجلة</span>
                        <span className="text-sm">لم يتم إضافة أي كتب للمكتبة بعد</span>
                    </div>
                )}
            </div>
        </div>
    );
}
