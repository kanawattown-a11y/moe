import { prisma } from '@/lib/prisma';
import NewSchoolForm from './form';

export default async function NewSchoolPageWrapper() {
    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    const villages = await prisma.village.findMany({ orderBy: { name: 'asc' } });

    return <NewSchoolForm cities={cities} villages={villages} />;
}
