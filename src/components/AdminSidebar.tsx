'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    School,
    Settings,
    FileText,
    Library,
    LogOut,
    Menu,
    X,
    CalendarDays,
    TrendingUp,
    ArrowRightLeft,
    UserMinus,
    UserCog,
    FormInput,
    Bell,
    CreditCard,
    Shield,
    UserPlus
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
    { name: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
    { name: 'إدارة المستخدمين', href: '/admin/users', icon: UserCog },
    { name: 'الموارد البشرية', href: '/admin/employees', icon: Users },
    { name: 'المدارس والمجمعات', href: '/admin/schools', icon: School },
    { name: 'الإجازات', href: '/admin/vacations', icon: CalendarDays },
    { name: 'الترفيعات', href: '/admin/promotions', icon: TrendingUp },
    { name: 'الندب والإيفاد', href: '/admin/movements', icon: ArrowRightLeft },
    { name: 'ترك العمل', href: '/admin/terminations', icon: UserMinus },
    { name: 'الأخبار والمقالات', href: '/admin/news', icon: FileText },
    { name: 'المكتبة الرقمية', href: '/admin/books', icon: Library },
    { name: 'النماذج المخصصة', href: '/admin/forms', icon: FormInput },
    { name: 'طلبات الانضمام', href: '/admin/approvals', icon: UserPlus },
    { name: 'الرواتب والأجور', href: '/admin/payroll', icon: CreditCard },
    { name: 'الإشعارات', href: '/admin/notifications', icon: Bell },
    { name: 'سجل التدقيق', href: '/admin/audit-logs', icon: Shield },
    { name: 'إعدادات النظام', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const userPermissions = (session?.user as any)?.permissions || [];

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm font-cairo">
                <div className="flex items-center gap-2 text-primary">
                    <School size={24} className="text-accent" />
                    <span className="font-bold text-lg tracking-tight">إدارة النظام</span>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Sidebar overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                // Mobile layout setup: Fixed overlay, slides in/out from right
                "fixed inset-y-0 right-0 z-50 w-64 bg-primary text-white flex flex-col font-cairo shadow-2xl transition-transform duration-300 ease-in-out shrink-0",
                isOpen ? "translate-x-0" : "translate-x-full",
                // Desktop layout setup: Becomes a standard flex item occupying layout space
                "md:relative md:translate-x-0"
            )}>
                {/* Mobile close button inside sidebar */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden absolute top-4 left-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Logo/Header */}
                <div className="p-6 text-center border-b border-white/10">
                    <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <School size={32} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">نظام إدارة التربية</h2>
                    <p className="text-xs text-blue-200 mt-1">لوحة تحكم المسؤول</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        if (userRole !== 'ADMIN' && item.href !== '/admin') {
                            if (!userPermissions.includes(item.href)) return null;
                        }

                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-accent text-primary font-bold shadow-md"
                                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <Icon size={20} className={clsx("transition-transform duration-200", isActive ? "" : "group-hover:scale-110")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer/Logout */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>

            </aside>
        </>
    );
}
