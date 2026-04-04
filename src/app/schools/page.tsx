import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function SchoolsPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = searchParams.q;

    const where: any = {};
    if (query) {
        where.name = { contains: query }; // Add mode: 'insensitive' if postgres extension enabled
    }

    const schools = await prisma.school.findMany({
        where,
        take: 50,
        orderBy: { name: 'asc' },
        include: {
            city: true,
            village: true,
            _count: {
                select: { employees: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            {/* Hero Header */}
            <div className="bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/logo.jpg" alt="bg" fill className="object-cover" />
                </div>
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">دليل المدارس والمجمعات</h1>
                        <p className="text-blue-100 text-lg">استعرض كافة المؤسسات التعليمية التابعة لوزارة التربية في جبل باشان</p>
                    </div>
                    <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                        <span>الرئيسية</span>
                        <span>&larr;</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Search */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-b-4 border-accent">
                    <form className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                name="q"
                                defaultValue={query}
                                placeholder="ابحث عن اسم المدرسة أو المجمع..."
                                className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 pr-12 text-primary font-medium focus:border-accent focus:ring-0 focus:outline-none transition bg-gray-50 focus:bg-white"
                            />
                            <span className="absolute right-4 top-3.5 text-gray-400">🔍</span>
                        </div>
                        <button type="submit" className="bg-accent text-primary font-bold px-8 py-3 rounded-lg hover:bg-accent/90 focus:outline-none shadow-md transition transform hover:scale-105">
                            بحث
                        </button>
                    </form>
                </div>

                {/* Schools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map((school) => (
                        <Link key={school.id} href={`/schools/${school.id}`} className="block group h-full">
                            <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 h-full flex flex-col border border-gray-100 hover:border-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="bg-blue-50 p-3 rounded-full text-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        🏫
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition line-clamp-1">
                                            {school.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <span>📍</span>
                                            <span>{itemOrDash(school.city?.name)} - {itemOrDash(school.village?.name)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span>👥</span>
                                            <span>الكادر:</span>
                                            <span className="font-bold text-primary">{school._count.employees}</span>
                                        </div>
                                        <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">
                                            {school.phase || 'مدرسة'}
                                        </span>
                                    </div>
                                    {school.phone && (
                                        <div className="mt-2 text-xs text-secondary text-left" dir="ltr">
                                            📞 {school.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {schools.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                            <div className="text-6xl mb-4 opacity-50">🏢</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مدارس مطابقة للبحث</h3>
                            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تأكد من صحة الاسم</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function itemOrDash(item: string | null | undefined) {
    return item || '-';
}
