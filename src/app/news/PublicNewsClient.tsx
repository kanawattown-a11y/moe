'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Newspaper, ChevronLeft, Calendar } from 'lucide-react';

export default function PublicNewsClient({ articles }: { articles: any[] }) {

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-cairo flex flex-col" dir="rtl">
            {/* Simple Header */}
            <div className="bg-primary text-white pt-24 pb-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <Image src="/logo.jpg" alt="bg" fill className="object-cover" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-right">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
                        >
                            الأخبار <span className="text-accent">والنشاطات</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-blue-100 font-medium"
                        >
                            ابقى على اطلاع دائم بآخر المستجدات والقرارات والإعلانات الرسمية
                        </motion.p>
                    </div>
                    <Link href="/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2">
                        <span>الرئيسية</span>
                        <span>&larr;</span>
                    </Link>
                </div>
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-20 -mt-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {articles.map((article) => (
                        <motion.div variants={itemVariants} key={article.id} className="h-full">
                            <Link href={`/news/${article.slug || article.id}`} className="group h-full flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-56 bg-gray-100 relative overflow-hidden">
                                    {article.image_url ? (
                                        <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                            <Image src="/logo.jpg" alt="Logo" width={80} height={80} className="opacity-10 grayscale" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 bg-gray-50 self-start px-3 py-1.5 rounded-full border border-gray-200">
                                        <Calendar size={14} className="text-primary" />
                                        <span>{new Date(article.created_at).toLocaleDateString('ar-SY')}</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                        {article.title}
                                    </h2>

                                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow leading-relaxed">
                                        {article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                    </p>

                                    <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center text-primary font-bold text-sm">
                                        <span className="flex items-center gap-2">
                                            المزيد من التفاصيل
                                        </span>
                                        <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {articles.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-200"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Newspaper size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد أخبار منشورة حالياً</h3>
                        <p className="text-gray-500">يرجى العودة لاحقاً لمتابعة أحدث المستجدات والنشاطات.</p>
                    </motion.div>
                )}
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500 font-bold mt-auto">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                        <Image src="/logo.jpg" alt="Logo" width={24} height={24} className="grayscale opacity-50" />
                        العودة للصفحة الرئيسية
                    </Link>
                    <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} وزارة التربية - جبل باشان</p>
                </div>
            </footer>
        </div>
    );
}
