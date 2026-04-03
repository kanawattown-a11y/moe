'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/actions';
import Image from 'next/image';
import Link from 'next/link';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className="w-full bg-accent text-primary font-bold py-3 px-4 rounded-xl hover:bg-accent/90 transition-all shadow-lg flex justify-center items-center gap-2 transform hover:-translate-y-1"
        >
            {pending ? (
                <>
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    جاري الدخول...
                </>
            ) : 'تسجيل الدخول'}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-cairo" dir="rtl">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 relative">
                <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-bold">
                    الرئيسية
                    <span>&larr;</span>
                </Link>
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image
                            src="/logo.jpg"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">تسجيل الدخول</h2>
                    <p className="mt-2 text-sm text-gray-600">نظام إدارة وزارة التربية - جبل باشان</p>
                </div>

                <form action={dispatch} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-primary focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-medium bg-gray-50/50 focus:bg-white"
                                placeholder="اسم المستخدم"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-medium bg-gray-50/50 focus:bg-white"
                                placeholder="********"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100 animate-pulse" role="alert">
                            <span>⚠️</span>
                            <p className="font-bold">{errorMessage}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <LoginButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
