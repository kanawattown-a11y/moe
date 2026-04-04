import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditNewsForm from '../../components/EditNewsForm';

export default async function EditNewsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
        notFound();
    }

    const article = await prisma.news.findUnique({
        where: { id },
    });

    if (!article) {
        notFound();
    }

    return <EditNewsForm article={article} />;
}
