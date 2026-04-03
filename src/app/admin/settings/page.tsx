import Link from 'next/link';
import { MapPin, Briefcase, GraduationCap, Settings2, DollarSign, Database } from 'lucide-react';

const settingsGroups = [
    {
        title: 'البيانات الجغرافية',
        icon: <MapPin className="text-blue-500" size={24} />,
        items: [
            { name: 'المدن والمناطق', url: '/admin/settings/cities' },
            { name: 'القرى والأحياء', url: '/admin/settings/villages' },
        ]
    },
    {
        title: 'البيانات الوظيفية',
        icon: <Briefcase className="text-emerald-500" size={24} />,
        items: [
            { name: 'المسميات الوظيفية', url: '/admin/settings/job-titles' },
            { name: 'الفئات الوظيفية', url: '/admin/settings/job-categories' },
            { name: 'النصاب المرجعي', url: '/admin/settings/reference-quotas' },
            { name: 'أنواع التعيين', url: '/admin/settings/appointment-types' },
            { name: 'أوضاع العمل', url: '/admin/settings/work-statuses' },
            { name: 'الأعمال المكلف بها', url: '/admin/settings/assigned-works' },
        ]
    },
    {
        title: 'المؤهلات العلمية التفصيلية',
        icon: <GraduationCap className="text-purple-500" size={24} />,
        items: [
            { name: 'الجامعات', url: '/admin/settings/universities' },
            { name: 'الكليات', url: '/admin/settings/colleges' },
            { name: 'أقسام الكليات', url: '/admin/settings/college-departments' },
            { name: 'تفاصيل كلية العلوم', url: '/admin/settings/science-college-details' },
            { name: 'المعاهد', url: '/admin/settings/institutes' },
            { name: 'أقسام المعاهد', url: '/admin/settings/institute-departments' },
            { name: 'الثانويات', url: '/admin/settings/high-schools' },
            { name: 'فروع الثانوية', url: '/admin/settings/high-school-branches' },
            { name: 'أنواع الشهادات', url: '/admin/settings/certificate-types' },
        ]
    },
    {
        title: 'الهيكلية الإدارية العليا',
        icon: <Briefcase className="text-blue-600" size={24} />,
        items: [
            { name: 'الوزارات', url: '/admin/settings/ministries' },
            { name: 'الدوائر', url: '/admin/settings/departments' },
            { name: 'الشعب', url: '/admin/settings/sections' },
        ]
    },
    {
        title: 'أخرى',
        icon: <Settings2 className="text-gray-500" size={24} />,
        items: [
            { name: 'المجمعات التربوية', url: '/admin/settings/educational-complexes' },
            { name: 'الأوضاع العائلية', url: '/admin/settings/marital-statuses' },
        ]
    },
    {
        title: 'البيانات المالية والإدارية',
        icon: <DollarSign className="text-amber-500" size={24} />,
        items: [
            { name: 'الأمانات', url: '/admin/settings/suwayda-secretariats' },
            { name: 'المعتمدين', url: '/admin/settings/financial-adopters' },
            { name: 'سقوف الأجور', url: '/admin/settings/salary-ceilings' },
            { name: 'أجور بدء التعيين', url: '/admin/settings/starting-salaries' },
        ]
    },
    {
        title: 'إعدادات النظام المتقدمة',
        icon: <Settings2 className="text-gray-800" size={24} />,
        items: [
            { name: 'جداول الربط المرجعية', url: '/admin/settings/system-links' }
        ]
    }
];

export default async function SettingsDashboard() {
    // 1. Fetch tables built via the No-Code Engine
    const { prisma } = await import('@/lib/prisma');
    const dynamicTables = await prisma.metaTable.findMany();

    const dynamicGroup = dynamicTables.length > 0 ? {
        title: 'الجداول المخصصة (ديناميكية)',
        icon: <Database className="text-purple-600" size={24} />,
        items: dynamicTables.map(t => ({
            name: t.title,
            url: `/admin/settings/dyn-${t.slug}`
        }))
    } : null;

    const finalGroups = dynamicGroup ? [...settingsGroups, dynamicGroup] : settingsGroups;

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Settings2 className="text-primary" size={32} />
                        إعدادات النظام والجداول المرجعية
                    </h1>
                    <p className="text-gray-500 mt-2">إدارة الثوابت والقوائم المستخدمة في النظام</p>
                </div>
                <Link href="/admin/builder" className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition font-bold shadow-md flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    منشئ الجداول المرن
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalGroups.map((group, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                            <span className="text-2xl bg-gray-50 p-2 rounded-lg">{group.icon}</span>
                            <h3 className="font-bold text-lg text-gray-800">{group.title}</h3>
                        </div>
                        <ul className="space-y-2">
                            {group.items.map((item, i) => (
                                <li key={i}>
                                    <Link href={item.url} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg text-gray-700 hover:text-primary transition group">
                                        <span>{item.name}</span>
                                        <span className="text-gray-300 group-hover:text-primary transform group-hover:-translate-x-1 transition">←</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
