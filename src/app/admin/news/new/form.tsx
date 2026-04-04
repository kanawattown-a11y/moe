'use client';

import { useActionState, useState } from 'react';
import { createArticle } from '@/app/actions';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import S3FileUpload from '@/components/S3FileUpload';

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

export default function ArticleForm() {
    const [state, dispatch] = useActionState(createArticle, undefined);
    const [imageUrl, setImageUrl] = useState("");

    return (
        <form action={dispatch} className="space-y-8 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الخبر <span className="text-red-500">*</span></label>
                        <input
                            name="title"
                            type="text"
                            required
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-bold text-lg"
                            placeholder="عنوان الخبر..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">مقتطف قصير (اختياري)</label>
                        <textarea
                            name="excerpt"
                            rows={2}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                            placeholder="ملخص يظهر في القائمة..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">نص الخبر الكامل <span className="text-red-500">*</span></label>
                        <textarea
                            name="content"
                            rows={10}
                            required
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-primary font-medium focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                            placeholder="اكتب تفاصيل الخبر هنا..."
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
                            <div className="mt-4 relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                <input type="hidden" name="image_url" value={imageUrl} />
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <h4 className="font-bold text-yellow-800 mb-1 text-sm">ملاحظة</h4>
                        <p className="text-yellow-700 text-xs text-justify">
                            سيتم رفع الصورة إلى مخزن S3 السحابي بشكل مباشر لضمان أفضل أداء للموقع.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-gray-100">
                <SubmitButton />
            </div>
        </form>
    );
}
