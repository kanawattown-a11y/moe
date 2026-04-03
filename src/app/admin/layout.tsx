import type { Metadata } from 'next';
import AdminSidebar from '@/components/AdminSidebar';

import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
    title: 'لوحة تحكم المسؤول - وزارة التربية',
    description: 'لوحة التحكم الإدارية لنظام الموارد البشرية والمدارس',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
                <AdminSidebar />
                <main className="flex-1 w-full min-w-0 overflow-y-auto pt-16 md:pt-0 relative">
                    <div className="min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
