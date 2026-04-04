import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    // Check if slug is numeric (ID) or string (Slug)
    const isId = !isNaN(Number(params.slug));
    const where = isId ? { id: Number(params.slug) } : { slug: params.slug };

    const article = await prisma.news.findFirst({
        where: {
            ...where,
            is_published: true,
        },
        include: { author: true }
    });

    if (!article) notFound();

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/news" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <span>&larr;</span> العودة للأخبار
                    </Link>
                    <Link href="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-bold text-sm transition-colors">
                        الرئيسية
                        <span>&larr;</span>
                    </Link>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {article.image_url && (
                        <div className="h-[400px] relative w-full">
                            <Image src={article.image_url} alt={article.title} fill className="object-cover" priority />
                        </div>
                    )}

                    <div className="p-8 md:p-12">
                        <header className="mb-8">
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">أخبار الوزارة</span>
                                <time>{new Date(article.created_at).toLocaleDateString('ar-SY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{article.title}</h1>
                            {article.excerpt && <p className="text-xl text-gray-600 leading-relaxed">{article.excerpt}</p>}
                        </header>

                        <div className="prose prose-lg max-w-none text-gray-800">
                            {/* Simply render text for now, assuming plain text or handled safely later */}
                            {article.content.split('\n').map((para, i) => (
                                <p key={i} className="mb-4 leading-8">{para}</p>
                            ))}
                        </div>

                        <hr className="my-8 border-gray-200" />

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div>
                                نشر بواسطة: <span className="font-semibold text-gray-900">{article.author?.username || 'المسؤول'}</span>
                            </div>
                            <div>
                                آخر تحديث: {new Date(article.updated_at).toLocaleDateString('ar-SY')}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
