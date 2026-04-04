import { prisma } from "@/lib/prisma";
import LandingPageClient from "./LandingPageClient";

export default async function LandingPage() {
  const latestNews = await prisma.news.findMany({
    where: { is_published: true },
    orderBy: { created_at: 'desc' },
    take: 3,
  });

  // Calculate some basic stats
  const employeeCount = await prisma.employee.count();
  const schoolCount = await prisma.school.count();
  const bookCount = await prisma.book.count();

  return (
    <LandingPageClient
      latestNews={latestNews}
      stats={{ employeeCount, schoolCount, bookCount }}
    />
  );
}
