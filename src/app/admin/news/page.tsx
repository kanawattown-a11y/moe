import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Plus, AlertCircle, Pencil } from 'lucide-react';
import SearchBar from '../employees/SearchBar';
import DeleteArticleButton from './components/DeleteArticleButton';
import { checkAuth, hasPermission, isManager } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

async function getArticles(query: string) {
    const where: any = {};
    if (query) {
        where.title = { 
            contains: query,
            mode: 'insensitive'
        };
    }
    return await prisma.news.findMany({
        where,
        orderBy: { created_at: 'desc' }
    });
}

export default async function AdminNewsPage(props: { searchParams: Promise<{ q?: string }> }) {
    const session = await checkAuth();
    if (!hasPermission(session, '/admin/news')) {
        redirect('/admin?error=Unauthorized');
    }
    const isUserAManager = isManager(session);

    const searchParams = await props.searchParams;
    const query = searchParams.q || '';
    const articles = await getArticles(query);

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة الأخبار</h1>
                    <p className="text-gray-500 mt-2">إضافة وتعديل وحذف الأخبار المعروضة في البوابة</p>
                </div>
                {isUserAManager && (
                    <Link href="/admin/news/new" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                        <Plus size={20} />
                        <span>إضافة خبر جديد</span>
                    </Link>
                )}
            </div>

            {/* Fast Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <SearchBar placeholder="بحث في الأخبار..." />
                <div className="text-gray-500 font-bold text-sm bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 whitespace-nowrap">
                    {query ? `نتائج البحث: ${articles.length}` : `إجمالي الأخبار: ${articles.length}`}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                        <tr>
                            <th className="p-4 w-20">الصورة</th>
                            <th className="p-4">العنوان</th>
                            <th className="p-4">تاريخ النشر</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {articles.map(article => (
                            <tr key={String(article.id)} className="hover:bg-blue-50/40 transition-colors group">
                                <td className="p-5">
                                    <div className="relative h-14 w-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                        {article.image_url ? (
                                            <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <Newspaper size={20} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-gray-900 leading-tight block group-hover:text-primary transition-colors line-clamp-2 max-w-md">{article.title}</div>
                                </td>
                                <td className="p-5 text-sm text-gray-600 font-medium">
                                    {new Date(article.created_at).toLocaleDateString('ar-SY')}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${article.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                        {article.is_published ? 'منشور' : 'مسودة'}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex gap-2 items-center">
                                        <Link 
                                            href={`/admin/news/${article.id}/edit`}
                                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                                        >
                                            <Pencil size={14} />
                                            <span>تعديل</span>
                                        </Link>
                                        <DeleteArticleButton 
                                            id={article.id} 
                                            title={article.title} 
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {articles.length === 0 && (
                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 mb-1">لا يوجد أخبار</span>
                        <span className="text-sm">لم يتم إضافة أخبار بعد</span>
                    </div>
                )}
            </div>
        </div>
    );
}
