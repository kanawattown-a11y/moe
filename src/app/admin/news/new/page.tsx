'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createArticle } from '@/app/admin/news/actions';
import Link from 'next/link';
import Image from 'next/image';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg disabled:bg-gray-400 flex items-center gap-2"
        >
            {pending ? (
                <>
                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                    جاري النشر...
                </>
            ) : 'نشر الخبر'}
        </button>
    );
}

type State = {
    message: string | null;
    errors?: {
        title?: string[];
        content?: string[];
        excerpt?: string[];
    };
};

export default function NewNewsPage() {
    const [state, dispatch] = useActionState(createArticle, { message: null, errors: {} } as State);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto font-cairo" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">إضافة خبر جديد</h1>
                <Link href="/admin/news" className="text-gray-500 hover:text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    &larr; إلغاء وعودة
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <form action={dispatch} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الخبر <span className="text-red-500">*</span></label>
                                <input
                                    name="title"
                                    type="text"
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-bold text-lg"
                                    placeholder="عنوان الخبر..."
                                />
                                {state?.errors?.title && <p className="text-red-500 text-sm mt-1">{state.errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">مقتطف قصير (اختياري)</label>
                                <textarea
                                    name="excerpt"
                                    rows={2}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                    placeholder="ملخص يظهر في البطاقات..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تفاصيل الخبر <span className="text-red-500">*</span></label>
                                <textarea
                                    name="content"
                                    rows={10}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                    placeholder="اكتب تفاصيل الخبر هنا..."
                                />
                                {state?.errors?.content && <p className="text-red-500 text-sm mt-1">{state.errors.content}</p>}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">صورة الخبر</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {preview ? (
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                                            <Image src={preview} alt="Preview" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="py-8 text-gray-400 flex flex-col items-center">
                                            <span className="text-4xl mb-2">📷</span>
                                            <span>اضغط لرفع صورة</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">يفضل صور عرضية (Landscape)</p>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <h4 className="font-bold text-yellow-800 mb-1 text-sm">ملاحظة</h4>
                                <p className="text-yellow-700 text-xs text-justify">
                                    سيتم نشر الخبر مباشرة على الصفحة الرئيسية وصفحة الأخبار العامة. يمكنك التعديل أو الحذف لاحقاً من لوحة التحكم.
                                </p>
                            </div>
                        </div>
                    </div>

                    {state?.message && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-bold flex items-center gap-2">
                            <span>⚠️</span> {state.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end border-t border-gray-100">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
