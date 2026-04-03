import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TABLE_CONFIG } from '@/app/admin/settings/constants';
import AddItemForm from './form';
import DeleteItemButton from './delete-button';

export const dynamic = 'force-dynamic';

export default async function GenericSettingPage(props: { params: Promise<{ table: string }> }) {
    const params = await props.params;
    const { table } = params;

    let config;
    let metaTable = null;

    if (table.startsWith('dyn-')) {
        const slug = table.replace('dyn-', '');
        // @ts-ignore
        metaTable = await prisma.metaTable.findUnique({
            where: { slug },
            include: { fields: true, relations: true }
        });
        if (!metaTable) notFound();
        config = {
            title: metaTable.title,
            model: metaTable.name,
            nameField: metaTable.fields.find((f: any) => f.type === 'String')?.name || 'id'
        };
    } else {
        config = TABLE_CONFIG[table];
        if (!config) notFound();

        // Check if there are dynamic fields for this system table
        // @ts-ignore
        metaTable = await prisma.metaTable.findUnique({
            where: { slug: table },
            include: { fields: true, relations: true }
        });
    }

    if (!config) notFound();

    // @ts-ignore
    // Find the correct model key on prisma (case-insensitive lookup)
    const modelKey = Object.keys(prisma).find(
        key => key.toLowerCase() === config.model.toLowerCase()
    );

    if (!modelKey || !(prisma as any)[modelKey]) {
        return (
            <div className="p-10 text-center font-cairo bg-white m-10 rounded-2xl shadow-sm border border-red-100">
                <div className="text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">الجدول غير جاهز</h1>
                <p className="text-gray-600 mb-6">الجدول "{config.title}" مسجل في النظام ولكن لم يتم بناء هيكليته في قاعدة البيانات بعد.</p>
                <div className="flex justify-center gap-4">
                    <Link href="/admin/builder" className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        تفعيل الجدول الآن
                    </Link>
                    <Link href="/admin/settings" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                        عودة للإعدادات
                    </Link>
                </div>
            </div>
        );
    }

    // @ts-ignore
    const items = await (prisma as any)[modelKey].findMany({
        orderBy: { id: 'desc' },
        take: 100
    });

    return (
        <div className="p-6 md:p-10 font-cairo bg-gray-50/30 min-h-screen" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                        <Link href="/admin/settings" className="hover:text-primary transition">الإعدادات</Link>
                        <span>/</span>
                        <span className="text-gray-600">{config.title}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{config.title}</h1>
                </div>
                <Link href="/admin/settings" className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm">
                    عودة للقائمة
                </Link>
            </div>

            <div className="max-w-6xl mx-auto">
                <AddItemForm tableSlug={table} metaTable={metaTable} isSystem={!table.startsWith('dyn-')} config={config} />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 overflow-x-auto">
                    <table className="w-full text-right whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                            <tr>
                                <th className="p-5 w-20">#</th>
                                {(!table.startsWith('dyn-')) && <th className="p-5">الاسم / البيان الأساسي</th>}

                                {metaTable && metaTable.fields.map((f: any) => (
                                    <th key={String(f.id)} className="p-5">{f.label}</th>
                                ))}

                                <th className="p-5 w-32">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {items.map((item: any) => (
                                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                                    <td className="p-5 text-gray-400 text-sm font-mono">{String(item.id)}</td>
                                    {(!table.startsWith('dyn-')) && (
                                        <td className="p-5 font-bold text-gray-900 group-hover:text-primary transition-colors">{item[config.nameField || 'name']}</td>
                                    )}

                                    {metaTable && metaTable.fields.map((f: any) => (
                                        <td key={String(f.id)} className="p-5 font-medium text-gray-800">
                                            {f.type === 'DateTime' && item[f.name] ? new Date(item[f.name]).toLocaleDateString('ar-SA') :
                                                f.type === 'Boolean' ? (item[f.name] ? 'نعم' : 'لا') :
                                                    String(item[f.name] ?? '-')}
                                        </td>
                                    ))}

                                    <td className="p-5">
                                        <DeleteItemButton tableSlug={table} id={String(item.id) as any} />
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={metaTable ? metaTable.fields.length + 2 : 3} className="p-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-lg text-gray-900 mb-1">لا توجد بيانات</span>
                                            <span className="text-sm">لم يتم إضافة أي بيانات لهذه القائمة بعد.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
