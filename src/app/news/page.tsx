import { prisma } from '@/lib/prisma';
import PublicNewsClient from './PublicNewsClient';

export const metadata = {
    title: 'الأخبار والنشاطات | وزارة التربية',
    description: 'آخر أخبار وإعلانات ونشاطات وزارة التربية',
};

export default async function PublicNewsPage() {
    const articles = await prisma.article.findMany({
        where: { is_published: true },
        orderBy: { created_at: 'desc' },
    });

    return <PublicNewsClient articles={articles} />;
}
