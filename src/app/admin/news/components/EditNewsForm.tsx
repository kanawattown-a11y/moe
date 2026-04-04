'use client';

import { useState, useActionState } from 'react';
import { updateArticle } from '@/app/actions';
import Link from 'next/link';
import Image from 'next/image';
import S3FileUpload from '@/components/S3FileUpload';
import { useFormStatus } from 'react-dom';

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
                    جاري الحفظ...
                </>
            ) : 'حفظ التعديلات'}
        </button>
    );
}

interface EditNewsFormProps {
    article: {
        id: number;
        title: string;
        content: string;
        excerpt: string | null;
        image_url: string | null;
        is_published: boolean;
    };
}


export default function EditNewsForm({ article }: EditNewsFormProps) {
    const [state, dispatch] = useActionState(updateArticle, undefined);
    const [imageUrl, setImageUrl] = useState(article.image_url || "");

    return (
        <div className="p-6 max-w-4xl mx-auto font-cairo" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">تعديل الخبر</h1>
                <Link href="/admin/news" className="text-gray-500 hover:text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    &larr; إلغاء وعودة
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <form action={dispatch} className="space-y-8">
                    <input type="hidden" name="id" value={article.id} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الخبر <span className="text-red-500">*</span></label>
                                <input
                                    name="title"
                                    type="text"
                                    defaultValue={article.title}
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-bold text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">مقتطف قصير</label>
                                <textarea
                                    name="excerpt"
                                    rows={2}
                                    defaultValue={article.excerpt || ""}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تفاصيل الخبر <span className="text-red-500">*</span></label>
                                <textarea
                                    name="content"
                                    rows={10}
                                    defaultValue={article.content}
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <S3FileUpload 
                                    name="image_url" 
                                    folder="news" 
                                    label="صورة الخبر"
                                    onUploadComplete={(url) => setImageUrl(url)}
                                />
                                {imageUrl && (
                                    <div className="mt-4 relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                        <input type="hidden" name="image_url" value={imageUrl} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <input 
                                    type="checkbox" 
                                    name="is_published" 
                                    id="is_published"
                                    defaultChecked={article.is_published}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="is_published" className="text-sm font-bold text-gray-700 pointer-events-auto cursor-pointer">منشور للعامة</label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end border-t border-gray-100">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
