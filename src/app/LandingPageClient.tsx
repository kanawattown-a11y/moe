'use client';

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Users, School, BookOpen, ChevronLeft, ArrowRight, Newspaper } from "lucide-react";

export default function LandingPageClient({ latestNews, stats }: any) {

    const fadeIn: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
                                <Image
                                    src="/logo.jpg"
                                    alt="شعار وزارة التربية"
                                    width={60}
                                    height={60}
                                    className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
                                />
                                <div className="hidden md:block">
                                    <h1 className="text-xl font-black text-primary leading-tight tracking-tight">جبل باشان</h1>
                                    <h2 className="text-sm font-bold text-accent">وزارة التربية والتعليم</h2>
                                </div>
                            </Link>
                        </motion.div>
                        <div className="flex items-center gap-6">
                            <Link href="/news" className="hidden md:block text-gray-600 hover:text-primary font-bold transition-colors">الأخبار والنشاطات</Link>
                            <Link href="/library" className="hidden md:block text-gray-600 hover:text-primary font-bold transition-colors">المكتبة الرقمية</Link>
                            <Link href="/admin" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-primary text-white overflow-hidden py-32 lg:py-40">
                <div className="absolute inset-0 opacity-10">
                    <Image src="/logo.jpg" alt="bg" fill className="object-cover" />
                </div>

                {/* Animated Orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
                        <motion.div variants={fadeIn}>
                            <Image
                                src="/logo.jpg"
                                alt="شعار وزارة التربية"
                                width={180}
                                height={180}
                                className="mx-auto mb-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                            />
                        </motion.div>
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                            وزارة التربية <span className="text-accent underline decoration-8 underline-offset-8">والتعليم</span>
                        </motion.h1>
                        <motion.p variants={fadeIn} className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                            نحو جيل مبدع، واعٍ، ومتميز. منصتكم التعليمية الشاملة لخدمات الطلاب، المعلمين، والمجتمع للارتقاء بالعملية التربوية.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                            <Link href="/library" className="group bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1">
                                <BookOpen className="text-accent" />
                                <span>تصفح المكتبة الرقمية</span>
                            </Link>
                            <Link href="/news" className="group bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 flex items-center justify-center gap-3 transition-all backdrop-blur-sm">
                                <span>آخر الأخبار والإعلانات</span>
                                <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 md:divide-x-reverse divide-gray-100">

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-10 text-center hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users size={32} />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-2">{stats.employeeCount.toLocaleString('ar-EG')}</h3>
                        <p className="text-gray-500 font-bold">معلم وموظف مسجل</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="p-10 text-center hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <School size={32} />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-2">{stats.schoolCount.toLocaleString('ar-EG')}</h3>
                        <p className="text-gray-500 font-bold">مدرسة ومجمع تربوي</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="p-10 text-center hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 mb-2">{stats.bookCount.toLocaleString('ar-EG')}</h3>
                        <p className="text-gray-500 font-bold">كتاب ومورد تعليمي</p>
                    </motion.div>

                </div>
            </section>

            {/* Latest News Preview */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-3">أحدث الأخبار والنشاطات</h2>
                        <div className="w-20 h-1.5 bg-accent rounded-full mb-4"></div>
                        <p className="text-gray-600 text-lg font-medium">تابع آخر مستجدات العملية التربوية والقرارات الوزارية</p>
                    </div>
                    <Link href="/news" className="group hidden md:flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors">
                        <span>عرض سجل الأخبار</span>
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {latestNews.length > 0 ? (
                        latestNews.map((article: any, index: number) => (
                            <motion.article
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                key={article.id}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col"
                            >
                                <div className="h-56 bg-gray-100 relative overflow-hidden">
                                    {article.image_url ? (
                                        <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                            <Image src="/logo.jpg" alt="Logo" width={60} height={60} className="opacity-20 grayscale" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-primary rounded-full shadow-sm">
                                        {new Date(article.created_at).toLocaleDateString('ar-SY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{article.title}</h3>
                                    <p className="text-gray-600 line-clamp-3 mb-6 text-sm leading-relaxed flex-grow">{article.excerpt || article.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...</p>

                                    <Link href={`/news/${article.slug || article.id}`} className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors mt-auto">
                                        المزيد من التفاصيل
                                        <ChevronLeft size={16} />
                                    </Link>
                                </div>
                            </motion.article>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Newspaper className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-bold text-lg">لا توجد أخبار منشورة حالياً.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary text-blue-100 py-16 border-t-8 border-accent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <Link href="/" className="flex items-center gap-3 mb-6">
                                <Image src="/logo.jpg" alt="شعار وزارة التربية" width={50} height={50} className="brightness-0 invert" />
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">جبل باشان</h2>
                                    <h3 className="text-sm font-semibold text-accent">وزارة التربية والتعليم</h3>
                                </div>
                            </Link>
                            <p className="text-sm leading-relaxed max-w-sm opacity-80">
                                نسعى لبناء نظام تعليمي متطور يواكب العصر، ويرتقي بقدرات أبنائنا لبناء مستقبل مشرق للوطن.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider">روابط سريعة</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link></li>
                                <li><Link href="/news" className="hover:text-accent transition-colors">الأخبار والنشاطات</Link></li>
                                <li><Link href="/library" className="hover:text-accent transition-colors">المكتبة الرقمية</Link></li>
                                <li><Link href="/schools" className="hover:text-accent transition-colors">دليل المدارس</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider">الخدمات الإلكترونية</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link href="/admin" className="hover:text-accent transition-colors">لوحة تحكم المسؤول</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center pt-8 border-t border-white/10 opacity-60 text-sm">
                        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} وزارة التربية - جبل باشان</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
