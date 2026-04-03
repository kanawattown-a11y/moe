import { prisma } from '@/lib/prisma';
import EditSchoolForm from './form';
import { notFound } from 'next/navigation';

export default async function EditSchoolPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) notFound();

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) notFound();

    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    const villages = await prisma.village.findMany({ orderBy: { name: 'asc' } });

    return <EditSchoolForm school={school} cities={cities} villages={villages} />;
}
