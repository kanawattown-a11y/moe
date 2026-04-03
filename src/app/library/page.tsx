import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Search, Download } from 'lucide-react';
import SearchableSelect from '@/components/SearchableSelect';

export default async function LibraryPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
    const query = searchParams.q;
    const categoryId = searchParams.category ? Number(searchParams.category) : undefined;

    const where: any = { is_public: true };
    if (query) {
        where.title = { contains: query }; // Case insensitive in Postgres usually requires mode: 'insensitive'
    }
    if (categoryId) {
        where.category_id = categoryId;
    }

    const books = await prisma.book.findMany({
        where,
        include: { category: true },
        orderBy: { created_at: 'desc' },
    });

    const categories = await prisma.libraryCategory.findMany();

    return (
        <div className="min-h-screen bg-gray-50/30 font-cairo" dir="rtl">
            {/* Header */}
            <div className="bg-primary text-white py-12">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">المكتبة الرقمية</h1>
                        <p className="text-blue-100 text-lg">مستودع المعرفة للطلاب والمعلمين. تصفح وحمل المناهج الدراسية، الكتب الإثرائية، والمراجع العلمية.</p>
                    </div>
                    <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                        <span>الرئيسية</span>
                        <span>&larr;</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Search & Filter */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <form className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="ابحث عن اسم الكتاب..."
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-primary font-medium focus:ring-2 focus:ring-accent focus:outline-none"
                            />
                        </div>
                        <div className="md:w-1/4">
                            <SearchableSelect
                                name="category"
                                defaultValue={categoryId || undefined}
                                options={[{ value: '', label: 'كل التصنيفات' }, ...categories.map(cat => ({ value: cat.id, label: cat.name }))]}
                                placeholder="كل التصنيفات"
                                className="w-full"
                            />
                        </div>
                        <button type="submit" className="bg-accent text-primary font-bold px-6 py-2 rounded-md hover:bg-accent/90 transition">
                            بحث
                        </button>
                    </form>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col h-full">
                            <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden rounded-t-lg">
                                {book.cover_url ? (
                                    <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <span className="text-4xl">📚</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{book.author_name || 'وزارة التربية'}</p>
                                {book.category && (
                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-4 self-start">
                                        {book.category.name}
                                    </span>
                                )}
                                <div className="mt-auto pt-2">
                                    <a
                                        href={book.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center bg-accent text-primary py-2 rounded hover:bg-accent/90 transition font-bold text-sm"
                                    >
                                        عرض / تحميل
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}

                    {books.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">لم يتم العثور على كتب تطابق بحثك.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
