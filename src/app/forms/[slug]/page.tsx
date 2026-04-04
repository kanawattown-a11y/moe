import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicForm from './PublicForm';
import { auth } from '@/auth';

export default async function CustomFormPublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const form = await prisma.customForm.findUnique({
        where: { slug },
        include: {
            fields: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!form) {
        notFound();
    }

    if (!form.is_active) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">النموذج مغلق</h1>
                    <p className="text-gray-500">نعتذر، هذا النموذج غير متاح حالياً لاستقبال الردود.</p>
                </div>
            </div>
        );
    }

    // Role-based authorization
    if (form.allowed_roles && form.allowed_roles.trim() !== '') {
        const session = await auth();

        if (!session || !session.user) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
                    <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center max-w-lg w-full">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🛡️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">يتطلب تسجيل الدخول</h1>
                        <p className="text-gray-500 mb-6">يجب عليك تسجيل الدخول بحساب معتمد لرؤية هذا النموذج.</p>
                        <a href="/login" className="bg-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition">تسجيل الدخول</a>
                    </div>
                </div>
            );
        }

        const userRole = (session.user as any).role || '';
        const allowedRolesList = form.allowed_roles.split(',').map((r: string) => r.trim().toLowerCase());

        if (!allowedRolesList.includes(userRole.toLowerCase()) && userRole !== 'admin') {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
                    <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center max-w-lg w-full">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⛔</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">صلاحيات غير كافية</h1>
                        <p className="text-gray-500">ليس لديك الصلاحية اللازمة للوصول إلى هذا النموذج وتعبئته.</p>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-cairo py-10 px-4" dir="rtl">
            <div className="max-w-3xl mx-auto">
                {/* Form Header */}
                <div className="bg-white rounded-t-3xl border-t-8 shadow-sm p-6 md:p-8 mb-6 transition-all duration-700" style={{ borderTopColor: form.header_color || '#9333ea' }}>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{form.title}</h1>
                    {form.description && (
                        <div className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                            {form.description}
                        </div>
                    )}
                </div>

                {/* Form Body */}
                <PublicForm form={{
                    ...form,
                    id: Number(form.id),
                    fields: form.fields.map((f: any) => ({
                        ...f,
                        id: Number(f.id),
                        points: f.points ? Number(f.points) : null,
                    }))
                } as any} />
            </div>
        </div>
    );
}
