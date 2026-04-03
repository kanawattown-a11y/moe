import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2, Clock } from 'lucide-react';
import { markAsRead, deleteNotification } from './actions';
import NotificationList from './NotificationList';

export default async function NotificationsPage() {
    const session = await auth();
    if (!session || !session.user) redirect('/login');

    const userId = Number(session.user.id);
    const notifications = await (prisma as any).notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 50
    });

    return (
        <div className="p-6 md:p-10 bg-gray-50/50 min-h-screen font-cairo" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-4 text-emerald-600">
                            <Bell size={36} className="text-primary animate-ring" />
                            مركز التنبيهات
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm font-bold">كل الأخبار والقرارات التي تهمك في مكان واحد</p>
                    </div>
                </div>

                <NotificationList notifications={notifications.map((n: any) => ({
                    ...n,
                    id: String(n.id),
                    user_id: String(n.user_id),
                    created_at: n.created_at?.toISOString(),
                }))} />
            </div>
        </div>
    );
}
